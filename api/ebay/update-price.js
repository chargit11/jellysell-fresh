import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTcwOTg3NSwiZXhwIjoyMDc1Mjg1ODc1fQ.YbeG-L6j2atmWo_99qOig3d3NSFtVYA5ZaZnCyN_CPg'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { listing_id, price, user_id } = req.body;

    console.log('Received request:', { listing_id, price, user_id });

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Get user's eBay token from database
    const { data: tokenData, error } = await supabase
      .from('user_tokens')
      .select('access_token')
      .eq('user_id', user_id)
      .eq('platform', 'ebay')
      .single();

    console.log('Token lookup result:', { tokenData, error });

    if (error || !tokenData) {
      return res.status(401).json({ error: 'No eBay token found for user. Please connect your eBay account first.' });
    }

    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
<ReviseItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${tokenData.access_token}</eBayAuthToken>
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
      return res.status(500).json({ error: 'Failed to update eBay listing: ' + xmlResponse });
    }

    return res.status(200).json({ success: true, message: 'Price updated on eBay' });
  } catch (error) {
    console.error('Update price error:', error);
    return res.status(500).json({ error: error.message });
  }
}
