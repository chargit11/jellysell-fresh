// API endpoint to exchange Etsy authorization code for access token
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, code_verifier, redirect_uri, client_id, client_secret } = req.body;

    if (!code || !code_verifier) {
      return res.status(400).json({ error: 'Authorization code and code verifier are required' });
    }

    // Etsy credentials
    const ETSY_CLIENT_ID = client_id || process.env.ETSY_KEYSTRING;
    const ETSY_CLIENT_SECRET = client_secret || process.env.ETSY_SHARED_SECRET;

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.etsy.com/v3/public/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: ETSY_CLIENT_ID,
        redirect_uri: redirect_uri,
        code: code,
        code_verifier: code_verifier
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Etsy token exchange failed:', errorText);
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to exchange authorization code',
        details: errorText 
      });
    }

    const tokens = await tokenResponse.json();

    // Return tokens to extension
    return res.status(200).json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type
    });

  } catch (error) {
    console.error('Error in Etsy token exchange:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
