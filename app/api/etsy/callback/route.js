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
      return Response.redirect('https://jellysell.com/connections?error=missing_params');
    }

    const { user_id } = JSON.parse(Buffer.from(state, 'base64').toString());

    const tokenResponse = await fetch('https://api.etsy.com/v3/public/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: 'zmldauxi8u7zz87qztr6l64x',
        redirect_uri: 'https://jellysell.com/api/etsy/callback',
        code: code,
        code_verifier: 'code_challenge',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return Response.redirect('https://jellysell.com/connections?error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();

    const userResponse = await fetch('https://openapi.etsy.com/v3/application/users/me', {
      headers: {
        'x-api-key': 'zmldauxi8u7zz87qztr6l64x',
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();
    const shop_id = userData.shop_id || userData.primary_shop_id;

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
      return Response.redirect('https://jellysell.com/connections?error=db_error');
    }

    return Response.redirect('https://jellysell.com/connections?success=etsy_connected');
  } catch (error) {
    console.error('Etsy callback error:', error);
    return Response.redirect(`https://jellysell.com/connections?error=${encodeURIComponent(error.message)}`);
  }
}
