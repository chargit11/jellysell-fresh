import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

async function refreshAccessToken(refresh_token) {
  try {
    const client_id = 'Christia-JellySel-PRD-edec84694-300e7c9b';
    const client_secret = 'PRD-dec8469432c4-0955-420e-89d4-44cc';
    const credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const resp = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
        scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/commerce.identity.readonly'
      })
    });

    const text = await resp.text();
    if (!resp.ok) {
      throw new Error(`Refresh failed ${resp.status}: ${text}`);
    }
    const json = JSON.parse(text);
    return json.access_token;
  } catch (e) {
    console.error('Refresh token error:', e);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, message_id, buyer_username, subject, text } = req.body || {};

    if (!user_id || !text) {
      return res.status(400).json({ error: 'user_id and text are required' });
    }

    const { data: tokenRow, error: tokenError } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', user_id)
      .eq('platform', 'ebay')
      .single();

    if (tokenError) {
      console.error('Token lookup error:', tokenError);
    }

    if (!tokenRow) {
      return res.status(400).json({ error: 'Not connected to eBay. Connect your eBay account first.' });
    }

    let accessToken = tokenRow.access_token;
    if (!accessToken && tokenRow.refresh_token) {
      accessToken = await refreshAccessToken(tokenRow.refresh_token);
    }

    const apiUrl = 'https://api.ebay.com/sell/communication/v1/message';
    const payload = {
      channel: 'EBAY',
      subject: subject ? String(subject).slice(0, 140) : 'Message from seller',
      text,
      to: buyer_username ? [{ recipient: 'BUYER', recipientId: buyer_username }] : undefined,
    };

    async function sendWithToken(token) {
      const ebayResp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const bodyText = await ebayResp.text();
      return { ok: ebayResp.ok, status: ebayResp.status, bodyText };
    }

    let result = { ok: false, status: 0, bodyText: '' };
    if (accessToken) {
      result = await sendWithToken(accessToken);
      if (!result.ok && tokenRow.refresh_token && result.status === 401) {
        const refreshed = await refreshAccessToken(tokenRow.refresh_token);
        if (refreshed) {
          accessToken = refreshed;
          result = await sendWithToken(accessToken);
        }
      }
    }

    if (!result.ok) {
      return res.status(result.status || 500).json({ error: 'Failed to send message to eBay', details: result.bodyText });
    }

    // Save local copy of outbound message for continuity
    await supabase.from('ebay_messages').insert({
      user_id,
      message_id: message_id || `local_${Date.now()}`,
      sender: 'You',
      subject: subject || '',
      body: text,
      read: true,
      created_at: new Date().toISOString(),
      platform: 'ebay'
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Send message exception:', error);
    return res.status(500).json({ error: error.message });
  }
}
