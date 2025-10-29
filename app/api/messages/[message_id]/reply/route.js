// app/api/messages/[message_id]/reply/route.js
// POST endpoint to send reply via eBay and save to database

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request, { params }) {
  try {
    const { message_id } = params;
    const { reply_text, user_id, item_id, recipient_id } = await request.json();

    if (!reply_text || !user_id || !recipient_id) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's eBay access token
    const { data: userData, error: userError } = await supabase
      .from('user_tokens')
      .select('ebay_access_token')
      .eq('user_id', user_id)
      .single();

    if (userError || !userData?.ebay_access_token) {
      return Response.json(
        { error: 'eBay not connected' },
        { status: 401 }
      );
    }

    const accessToken = userData.ebay_access_token;

    // Send reply via eBay AddMemberMessageRTQ API
    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
<AddMemberMessageRTQRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${accessToken}</eBayAuthToken>
  </RequesterCredentials>
  <ItemID>${item_id}</ItemID>
  <MemberMessage>
    <Body>${escapeXml(reply_text)}</Body>
    <DisplayToPublic>false</DisplayToPublic>
    <EmailCopyToSender>false</EmailCopyToSender>
    <ParentMessageID>${message_id}</ParentMessageID>
    <RecipientID>${recipient_id}</RecipientID>
  </MemberMessage>
</AddMemberMessageRTQRequest>`;

    const ebayResponse = await fetch('https://api.ebay.com/ws/api.dll', {
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

    const xmlText = await ebayResponse.text();
    
    // Check if eBay API call was successful
    const ackMatch = xmlText.match(/<Ack>(.*?)<\/Ack>/);
    if (!ackMatch || ackMatch[1] !== 'Success') {
      const errorMatch = xmlText.match(/<ShortMessage>(.*?)<\/ShortMessage>/);
      const errorMsg = errorMatch ? errorMatch[1] : 'eBay API error';
      throw new Error(errorMsg);
    }

    // Save the sent message to database as an outgoing message
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id: user_id,
        message_id: `${message_id}-reply-${Date.now()}`,
        sender: 'YOU', // Will be replaced with actual username
        recipient: recipient_id,
        subject: `Re: `,
        body: reply_text,
        item_id: item_id,
        direction: 'outgoing',
        read: true,
        platform: 'ebay',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Failed to save sent message:', insertError);
      // Don't fail the request - message was sent successfully
    }

    return Response.json({
      success: true,
      message: 'Reply sent successfully'
    });

  } catch (error) {
    console.error('Error sending reply:', error);
    return Response.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
