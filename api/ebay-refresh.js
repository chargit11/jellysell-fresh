export default async function handler(req, res) {
  console.log('EBAY REFRESH ENDPOINT HIT');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'No refresh token provided' });
    }

    const client_id = 'Christia-JellySel-PRD-edec84694-300e7c9b';
    const client_secret = 'PRD-dec8469432c4-0955-420e-89d4-44cc';
    
    const credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    
    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/commerce.identity.readonly'
      })
    });
    
    const responseText = await tokenResponse.text();
    console.log('eBay refresh status:', tokenResponse.status);
    console.log('eBay refresh response:', responseText);
    
    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({ error: responseText });
    }
    
    const tokens = JSON.parse(responseText);
    
    return res.status(200).json({
      access_token: tokens.access_token,
      expires_in: tokens.expires_in
    });
    
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ error: error.message });
  }
}
