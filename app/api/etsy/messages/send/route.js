import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function refreshEtsyToken(refreshToken, userId) {
  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ETSY_CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Etsy token');
  }

  const data = await response.json();

  await supabase
    .from('etsy_tokens')
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    })
    .eq('user_id', userId);

  return data.access_token;
}

export async function POST(req) {
  try {
    const { recipient, body, user_id } = await req.json();

    if (!recipient || !body || !user_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from('etsy_tokens')
      .select('access_token, refresh_token, expires_at, shop_id')
      .eq('user_id', user_id)
      .single();

    if (tokenError || !tokenData) {
      return Response.json({ error: 'Etsy not connected' }, { status: 401 });
    }

    let accessToken = tokenData.access_token;

    if (new Date(tokenData.expires_at) <= new Date()) {
      accessToken = await refreshEtsyToken(tokenData.refresh_token, user_id);
    }

    const shopResponse = await fetch(`https://openapi.etsy.com/v3/application/shops/${tokenData.shop_id}`, {
      headers: {
        'x-api-key': process.env.ETSY_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!shopResponse.ok) {
      throw new Error('Failed to get shop details');
    }

    const shopData = await shopResponse.json();
    const shopUserId = shopData.user_id;

    const conversationsResponse = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${tokenData.shop_id}/conversations?limit=100`,
      {
        headers: {
          'x-api-key': process.env.ETSY_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!conversationsResponse.ok) {
      throw new Error('Failed to get conversations');
    }

    const conversationsData = await conversationsResponse.json();
    
    const conversation = conversationsData.results?.find(conv => {
      const otherParty = conv.messages?.[0]?.sender_user_id === shopUserId 
        ? conv.messages?.[0]?.receiver_user_id 
        : conv.messages?.[0]?.sender_user_id;
      
      return conv.other_party?.login_name === recipient;
    });

    if (!conversation) {
      return Response.json({ 
        error: 'Could not find conversation with this buyer. Please reply on Etsy.com' 
      }, { status: 404 });
    }

    const sendResponse = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${tokenData.shop_id}/conversations/${conversation.conversation_id}/messages`,
      {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ETSY_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: body,
        }),
      }
    );

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    const sentMessage = await sendResponse.json();

    const { data: savedMessage, error: saveError } = await supabase
      .from('etsy_messages')
      .insert({
        user_id,
        message_id: sentMessage.message_id,
        conversation_id: conversation.conversation_id,
        buyer_username: recipient,
        body,
        direction: 'outgoing',
        created_at: new Date().toISOString(),
        read: true,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving message to database:', saveError);
    }

    return Response.json({ 
      success: true, 
      data: savedMessage || {
        message_id: sentMessage.message_id,
        buyer_username: recipient,
        body,
        direction: 'outgoing',
        created_at: new Date().toISOString(),
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error sending Etsy message:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
