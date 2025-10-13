// app/api/messages/[message_id]/route.js

import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://qvhjmzdavsbauugubfcm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw';

// GET - Fetch message thread
export async function GET(request, context) {
  try {
    const params = await context.params;
    const { message_id } = params;
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch from Supabase
    const supabaseResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/ebay_messages?message_id=eq.${message_id}&user_id=eq.${user_id}`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!supabaseResponse.ok) {
      throw new Error('Failed to fetch message');
    }

    const messages = await supabaseResponse.json();
    
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const msg = messages[0];

    // Transform to conversation format
    const conversation = [{
      id: msg.message_id,
      sender: 'buyer',
      content: msg.body || msg.subject || 'No message content',
      timestamp: msg.created_at,
      senderName: msg.sender
    }];

    return NextResponse.json({
      conversation,
      sender: msg.sender,
      subject: msg.subject
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 });
  }
}

// POST - Send reply
export async function POST(request, { params }) {
  try {
    const { message_id } = params;
    const body = await request.json();
    const { message, user_id } = body;

    console.log('Sending reply for message_id:', message_id);
    console.log('User ID:', user_id);

    if (!user_id || !message?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Get the original message
    const supabaseResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/ebay_messages?message_id=eq.${message_id}&user_id=eq.${user_id}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const messages = await supabaseResponse.json();
    console.log('Original message:', messages);

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Original message not found' }, { status: 404 });
    }

    const originalMessage = messages[0];

    // 2. Get user's eBay token
    const tokenResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_tokens?user_id=eq.${user_id}&platform=eq.ebay&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const tokens = await tokenResponse.json();
    console.log('Tokens found:', tokens?.length || 0);

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ error: 'eBay not connected. Please connect your eBay account.' }, { status: 401 });
    }

    const ebayToken = tokens[0].access_token;

    // 3. Send reply via eBay API
    const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<AddMemberMessageAAQToPartnerRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${ebayToken}</eBayAuthToken>
  </RequesterCredentials>
  <ItemID>${originalMessage.item_id || ''}</ItemID>
  <MemberMessage>
    <Body><![CDATA[${message}]]></Body>
    <RecipientID>${originalMessage.sender}</RecipientID>
    <Subject>Re: ${originalMessage.subject || 'Your message'}</Subject>
  </MemberMessage>
</AddMemberMessageAAQToPartnerRequest>`;

    console.log('Sending to eBay API...');

    const ebayResponse = await fetch('https://api.ebay.com/ws/api.dll', {
      method: 'POST',
      headers: {
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-CALL-NAME': 'AddMemberMessageAAQToPartner',
        'Content-Type': 'text/xml'
      },
      body: xmlPayload
    });

    const responseText = await ebayResponse.text();
    console.log('eBay response:', responseText);

    // Check if successful
    if (responseText.includes('<Ack>Success</Ack>') || responseText.includes('<Ack>Warning</Ack>')) {
      return NextResponse.json({
        success: true,
        messageId: Date.now().toString(),
        timestamp: new Date().toISOString()
      });
    } else {
      // Extract error from XML
      const errorMatch = responseText.match(/<LongMessage>(.*?)<\/LongMessage>/);
      const errorMessage = errorMatch ? errorMatch[1] : 'eBay API returned error';
      
      return NextResponse.json({ 
        error: errorMessage,
        details: responseText.substring(0, 500)
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Reply error:', error);
    return NextResponse.json({ 
      error: 'Failed to send reply',
      details: error.message 
    }, { status: 500 });
  }
}
