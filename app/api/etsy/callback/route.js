import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connections?error=missing_params`);
    }

    const { user_id } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.etsy.com/v3/public/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.ETSY_CLIENT_ID,
        redirect_uri: process.env.ETSY_REDIRECT_URI,
        code: code,
        code_verifier: 'code_challenge',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connections?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();

    // Get shop info
    const userResponse = await fetch('https://openapi.etsy.com/v3/application/users/me', {
      headers: {
        'x-api-key': process.env.ETSY_CLIENT_ID,
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();
    const shop_id = userData.shop_id || userData.primary_shop_id;

    // Store tokens in database
    const { error: dbError } = await supabase
      .from('etsy_tokens')
      .upsert({
        user_id,
        shop_id: shop_id.toString(),
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connections?error=db_error`);
    }

    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connections?success=etsy_connected`);
  } catch (error) {
    console.error('Etsy callback error:', error);
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connections?error=${encodeURIComponent(error.message)}`);
  }
}
