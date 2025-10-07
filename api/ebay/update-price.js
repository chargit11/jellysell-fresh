export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { listing_id, price, user_id } = req.body;

    if (!listing_id || !price || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user's eBay access token from your database or storage
    // For now, we'll need to add a table to store user tokens
    // This is a placeholder - you need to implement token storage
    
    // Call eBay Trading API to revise the item
    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
<ReviseItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>USER_ACCESS_TOKEN_HERE</eBayAuthToken>
  </RequesterCredentials>
  <Item>
    <ItemID>${listing_id}</ItemID>
    <StartPrice>${price}</StartPrice>
  </Item>
</ReviseItemRequest>`;

    const response = await fetch('https://api.ebay.com/ws/api.dll', {
      method: 'POST',
      headers: {
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-CALL-NAME': 'ReviseItem',
        'X-EBAY-API-APP-NAME': 'Christia-JellySel-PRD-edec84694-300e7c9b',
        'Content-Type': 'text/xml'
      },
      body: xmlRequest
    });

    const xmlResponse = await response.text();
    console.log('eBay ReviseItem response:', xmlResponse);

    if (!response.ok || xmlResponse.includes('<Ack>Failure</Ack>')) {
      throw new Error('Failed to update eBay listing');
    }

    return res.status(200).json({ success: true, message: 'Price updated on eBay' });
  } catch (error) {
    console.error('Update price error:', error);
    return res.status(500).json({ error: error.message });
  }
}
