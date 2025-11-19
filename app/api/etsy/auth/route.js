import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function base64URLEncode(str) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return Response.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Generate PKCE code verifier and challenge
    const codeVerifier = base64URLEncode(crypto.randomBytes(32));
    const codeChallenge = base64URLEncode(sha256(codeVerifier));

    // Store verifier in state so we can retrieve it in callback
    const state = Buffer.from(JSON.stringify({ 
      user_id, 
      code_verifier: codeVerifier 
    })).toString('base64');
    
    const authUrl = new URL('https://www.etsy.com/oauth/connect');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', 'https://jellysell.com/api/etsy/callback');
    authUrl.searchParams.append('scope', 'listings_r listings_w transactions_r email_r shops_r');
    authUrl.searchParams.append('client_id', 'zmldauxi8u7zz87qztr6l64x');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    return Response.redirect(authUrl.toString());
  } catch (error) {
    console.error('Etsy auth error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
