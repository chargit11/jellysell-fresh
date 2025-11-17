export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

// Helper function to extract item ID from text
const extractItemIdFromText = (text) => {
  if (!text) return null;
  // Match eBay item IDs (typically 12-14 digits)
  const match = text.match(/\b(\d{12,14})\b/);
  return match ? match[1] : null;
};

export async function POST(request) {
  console.log('=== MESSAGE SEND API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    let { recipient, body: messageBody, itemId, user_id } = body;
    
    console.log('Sending message to eBay:', { recipient, itemId, user_id });
    
    if (!user_id || !recipient || !messageBody) {
      console.error('Missing fields:', { user_id, recipient, messageBody });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the original message from the conversation - REMOVED the item_id filter
    console.log('Fetching original message from database...');
    const { data: originalMessages, error: msgError } = await supabase
      .from('ebay_messages')
      .select('message_id, item_id, subject, body')
      .eq('sender', recipient)
      .eq('direction', 'incoming')
      .order('created_at', { ascending: false })
      .limit(1);

    if (msgError || !originalMessages || originalMessages.length === 0) {
      console.error('Could not find original message:', msgError);
      return NextResponse.json({ 
        error: 'Cannot reply: Original message not found in database' 
      }, { status: 400 });
    }

    const originalMessage = originalMessages[0];
    const originalMessageId = originalMessage.message_id;
    
    // Use provided itemId first, then database item_id, then extract from text
    if (!itemId) {
      itemId = originalMessage.item_id;
    }
    
    if (!itemId) {
      // Try to extract from subject/body
      itemId = extractItemIdFromText(originalMessage.subject) || extractItemIdFromText(originalMessage.body);
      if (itemId) {
        console.log('Extracted item ID from message text:', itemId);
      }
    }

    console.log('Original message ID:', originalMessageId);
    console.log('Item ID:', itemId);

    if (!itemId) {
      return NextResponse.json({ 
        error: 'Cannot send message: No item ID found in database or message text' 
      }, { status: 400 });
    }
    
    // Get user's eBay access token from database
    console.log('Fetching eBay token for user_id:', user_id);
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('access_token')
      .eq('user_id', user_id)
      .eq('platform', 'ebay')
      .single();
    
    if (tokenError || !tokenData?.access_token) {
      console.error('No eBay token found:', tokenError);
      return NextResponse.json({ error: 'eBay account not connected' }, { status: 401 });
    }
    
    const accessToken = tokenData.access_token;
    console.log('Got eBay access token');
    
    // Use AddMemberMessageRTQ (Reply To Question) instead of AAQToPartner
    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
<AddMemberMessageRTQRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${accessToken}</eBayAuthToken>
  </RequesterCredentials>
  <ItemID>${itemId}</ItemID>
  <MemberMessage>
    <Body>${messageBody.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Body>
    <ParentMessageID>${originalMessageId}</ParentMessageID>
    <RecipientID>${recipient}</RecipientID>
  </MemberMessage>
</AddMemberMessageRTQRequest>`;
    
    console.log('Sending request to eBay API...');
    console.log('Using AddMemberMessageRTQ (Reply To Question)');
    console.log('ParentMessageID:', originalMessageId);
    
    const response = await fetch('https://api.ebay.com/ws/api.dll', {
      method: 'POST',
      headers: {
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-CALL-NAME': 'AddMemberMessageRTQ',
        'X-EBAY-API-APP-NAME': 'Christia-JellySel-PRD-edec84694-300e7c9b',
        'X-EBAY-API-DEV-NAME': 'Christia-JellySel-PRD-edec84694-300e7c9b',
        'X-EBAY-API-CERT-NAME': 'PRD-dec8469432c4-0955-420e-89d4-44cc',
        'Content-Type': 'text/xml'
      },
      body: xmlRequest
    });
    
    const xmlText = await response.text();
    console.log('eBay API response:', xmlText);
    
    // Extract detailed error information
    const ackMatch = xmlText.match(/<Ack>(.*?)<\/Ack>/);
    const ack = ackMatch ? ackMatch[1] : 'Unknown';
    
    const errorCodeMatch = xmlText.match(/<ErrorCode>(.*?)<\/ErrorCode>/);
    const errorCode = errorCodeMatch ? errorCodeMatch[1] : null;
    
    const shortMessageMatch = xmlText.match(/<ShortMessage>(.*?)<\/ShortMessage>/);
    const shortMessage = shortMessageMatch ? shortMessageMatch[1] : null;
    
    const longMessageMatch = xmlText.match(/<LongMessage>(.*?)<\/LongMessage>/);
    const longMessage = longMessageMatch ? longMessageMatch[1] : null;
    
    console.log('Parsed eBay response:', { ack, errorCode, shortMessage, longMessage });
    
    // Check if successful
    if (xmlText.includes('<Ack>Success</Ack>') || xmlText.includes('<Ack>Warning</Ack>')) {
      console.log('Message sent successfully to eBay');
      
      // Save sent message to database
      const newMessage = {
        user_id: user_id,
        message_id: `sent_${Date.now()}_${Math.random()}`,
        sender: recipient,
        subject: '',
        body: messageBody,
        direction: 'outgoing',
        read: true,
        deleted: false,
        created_at: new Date().toISOString(),
        platform: 'ebay',
        item_id: itemId
      };
      
      console.log('Saving message to database...');
      const { error: dbError } = await supabase
        .from('ebay_messages')
        .insert([newMessage]);
      
      if (dbError) {
        console.error('Error saving message to database:', dbError);
      } else {
        console.log('Message saved to database');
      }
      
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        data: newMessage
      });
    } else {
      // Return detailed error information
      const errorDetails = {
        ack,
        errorCode,
        shortMessage,
        longMessage,
        itemId,
        recipient,
        originalMessageId,
        fullXmlResponse: xmlText.substring(0, 2000)
      };
      
      console.error('eBay API error:', errorDetails);
      
      return NextResponse.json(
        { 
          error: shortMessage || 'Failed to send message via eBay',
          details: errorDetails
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send message API:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to send message', message: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS'
    }
  });
}
