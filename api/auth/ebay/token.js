// API endpoint to exchange eBay authorization code for access token
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, redirect_uri, client_id, client_secret } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // eBay credentials - use environment variables in production
    const EBAY_CLIENT_ID = client_id || process.env.EBAY_CLIENT_ID;
    const EBAY_CLIENT_SECRET = client_secret || process.env.EBAY_CLIENT_SECRET;

    // Encode credentials for Basic Auth
    const credentials = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString('base64');

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('eBay token exchange failed:', errorText);
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
    console.error('Error in eBay token exchange:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
