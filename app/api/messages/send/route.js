export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

export async function POST(request) {
  console.log('=== MESSAGE SEND API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { recipient, body: messageBody, itemId, user_id } = body;
    
    console.log('Sending message to eBay:', { recipient, itemId, user_id });
    
    if (!user_id || !recipient || !messageBody) {
      console.error('Missing fields:', { user_id, recipient, messageBody });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get user's eBay access token from database
    console.log('Fetching eBay token for user_id:', user_id);
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('access_token')
      .eq('user_id', user_id)
      .single();
    
    if (tokenError || !tokenData?.access_token) {
      console.error('No eBay token found:', tokenError);
      return NextResponse.json({ error: 'eBay account not connected' }, { status: 401 });
    }
    
    const accessToken = tokenData.access_token;
    console.log('Got eBay access token');
    
    // Send message via eBay Trading API
    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
<AddMemberMessageAAQToPartnerRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${accessToken}</eBayAuthToken>
  </RequesterCredentials>
  <ItemID>${itemId}</ItemID>
  <MemberMessage>
    <Body>${messageBody.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Body>
    <RecipientID>${recipient}</RecipientID>
  </MemberMessage>
</AddMemberMessageAAQToPartnerRequest>`;
    
    console.log('Sending request to eBay API...');
    const response = await fetch('https://api.ebay.com/ws/api.dll', {
      method: 'POST',
      headers: {
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-CALL-NAME': 'AddMemberMessageAAQToPartner',
        'X-EBAY-API-APP-NAME': process.env.EBAY_CLIENT_ID,
        'X-EBAY-API-DEV-NAME': process.env.EBAY_CLIENT_ID,
        'X-EBAY-API-CERT-NAME': process.env.EBAY_CLIENT_SECRET,
        'Content-Type': 'text/xml'
      },
      body: xmlRequest
    });
    
    const xmlText = await response.text();
    console.log('eBay API response:', xmlText);
    
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
      console.error('eBay API error:', xmlText);
      return NextResponse.json(
        { error: 'Failed to send message via eBay', details: xmlText },
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
