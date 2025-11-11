// app/api/ebay/callback/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect('https://jellysell.com/connections?error=no_code');
    }

    // Parse state to get user_id
    let user_id;
    try {
      const stateData = JSON.parse(decodeURIComponent(state));
      user_id = stateData.user_id;
    } catch (e) {
      console.error('Error parsing state:', e);
      return NextResponse.redirect('https://jellysell.com/connections?error=invalid_state');
    }

    if (!user_id) {
      return NextResponse.redirect('https://jellysell.com/connections?error=no_user_id');
    }

    // Exchange authorization code for access token
    const clientId = 'Christia-JellySel-PRD-edec84694-300e7c9b';
    const clientSecret = process.env.EBAY_CLIENT_SECRET;
    const redirectUri = 'https://jellysell.com/api/ebay/callback';

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('eBay token exchange failed:', errorText);
      return NextResponse.redirect('https://jellysell.com/connections?error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();
    
    // Save tokens to Supabase
    const { error: upsertError } = await supabase
      .from('ebay_tokens')
      .upsert({
        user_id: user_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Error saving tokens:', upsertError);
      return NextResponse.redirect('https://jellysell.com/connections?error=save_failed');
    }

    // Redirect back to connections page with success
    return NextResponse.redirect('https://jellysell.com/connections?success=ebay_connected');

  } catch (error) {
    console.error('Error in eBay callback:', error);
    return NextResponse.redirect('https://jellysell.com/connections?error=unknown');
  }
}
