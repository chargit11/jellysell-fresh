import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

export async function POST(request) {
  try {
    const { recipient, body, itemId, user_id } = await request.json();

    console.log('Sending message to eBay:', { recipient, itemId, user_id });

    if (!user_id || !recipient || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's eBay access token from database
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('ebay_access_token')
      .eq('user_id', user_id)
      .single();

    if (tokenError || !tokenData?.ebay_access_token) {
      console.error('No eBay token found:', tokenError);
      return NextResponse.json({ error: 'eBay account not connected' }, { status: 401 });
    }

    const accessToken = tokenData.ebay_access_token;

    // Send message via eBay Trading API
    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
<AddMemberMessageAAQToPartnerRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${accessToken}</eBayAuthToken>
  </RequesterCredentials>
  <ItemID>${itemId}</ItemID>
  <MemberMessage>
    <Body>${body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Body>
    <RecipientID>${recipient}</RecipientID>
  </MemberMessage>
</AddMemberMessageAAQToPartnerRequest>`;

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
      // Save sent message to database
      const newMessage = {
        user_id: user_id,
        message_id: `sent_${Date.now()}_${Math.random()}`,
        sender: recipient,
        subject: '',
        body: body,
        direction: 'outgoing',
        read: true,
        created_at: new Date().toISOString(),
        platform: 'ebay',
        item_id: itemId
      };

      const { error: dbError } = await supabase
        .from('ebay_messages')
        .insert([newMessage]);

      if (dbError) {
        console.error('Error saving message to database:', dbError);
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
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message', message: error.message },
      { status: 500 }
    );
  }
}
