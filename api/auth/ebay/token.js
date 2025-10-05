export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, redirect_uri, client_id, client_secret } = req.body;
    
    console.log('eBay token exchange request received');
    console.log('Has code:', !!code);
    console.log('Redirect URI:', redirect_uri);

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

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

    const responseText = await tokenResponse.text();
    console.log('eBay API response status:', tokenResponse.status);
    console.log('eBay API response:', responseText);

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({ 
        error: 'eBay token exchange failed',
        details: responseText 
      });
    }

    const tokens = JSON.parse(responseText);

    return res.status(200).json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type
    });

  } catch (error) {
    console.error('eBay token exchange error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
