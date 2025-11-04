
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { listings, orders, user_id } = req.body;
    
    console.log('Received eBay data');
    console.log('User ID:', user_id);
    console.log('Items count:', listings?.items?.length || 0);

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    if (listings?.items && listings.items.length > 0) {
      const listingsData = listings.items.map(item => ({
        user_id: user_id,
        listing_id: item.itemId?.[0] || 'unknown',
        title: item.title?.[0] || 'Untitled',
        price: parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || 0),
        quantity: parseInt(item.quantity?.[0] || 1),
        image: item.galleryURL?.[0] || null,
        platform: 'ebay',
        url: item.viewItemURL?.[0] || null
      }));

      console.log('Saving listings:', JSON.stringify(listingsData, null, 2));

      const { error: listingsError } = await supabase
        .from('ebay_listings')
        .upsert(listingsData, { onConflict: 'listing_id' });

      if (listingsError) {
        console.error('Listings save error:', listingsError);
        throw listingsError;
      }

      console.log('Saved', listingsData.length, 'listings');
    }

    return res.status(200).json({
      success: true,
      message: 'eBay data synced successfully',
      stats: {
        listings: listings?.items?.length || 0,
        orders: orders?.orders?.length || 0
      }
    });
  } catch (error) {
    console.error('Error syncing eBay data:', error);
    return res.status(500).json({ 
      error: 'Failed to sync eBay data',
      message: error.message 
    });
  }
}
