export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return Response.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const state = Buffer.from(JSON.stringify({ user_id })).toString('base64');
    
    const authUrl = new URL('https://www.etsy.com/oauth/connect');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', process.env.ETSY_REDIRECT_URI);
    authUrl.searchParams.append('scope', 'listings_r listings_w transactions_r email_r shops_r');
    authUrl.searchParams.append('client_id', process.env.ETSY_CLIENT_ID);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', 'code_challenge');
    authUrl.searchParams.append('code_challenge_method', 'S256');

    return Response.redirect(authUrl.toString());
  } catch (error) {
    console.error('Etsy auth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
