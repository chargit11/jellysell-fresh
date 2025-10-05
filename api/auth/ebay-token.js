export default async function handler(req, res) {
  console.log('EBAY TOKEN ENDPOINT HIT');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, redirect_uri, client_id, client_secret } = req.body;
    
    console.log('Code exists:', !!code);

    if (!code) {
      return res.status(400).json({ error: 'No code' });
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
    console.log('eBay status:', tokenResponse.status);
    console.log('eBay response:', responseText);

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({ error: responseText });
    }

    const tokens = JSON.parse(responseText);

    return res.status(200).json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
