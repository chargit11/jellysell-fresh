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
    const { listings, orders } = req.body;

    console.log('Received eBay data');
    console.log('Listings count:', listings?.inventoryItems?.length || 0);
    console.log('Orders count:', orders?.orders?.length || 0);

    // Save listings to Supabase
    if (listings?.inventoryItems && listings.inventoryItems.length > 0) {
      const listingsData = listings.inventoryItems.map(item => ({
        listing_id: item.sku || item.offerId,
        title: item.product?.title || 'Untitled',
        price: parseFloat(item.availability?.price?.value || 0),
        quantity: parseInt(item.availability?.shipToLocationAvailability?.quantity || 0)
      }));

      const { error: listingsError } = await supabase
        .from('ebay_listings')
        .upsert(listingsData, { onConflict: 'listing_id' });

      if (listingsError) {
        console.error('Listings save error:', listingsError);
        throw listingsError;
      }

      console.log('Saved', listingsData.length, 'listings');
    }

    // Save orders to Supabase
    if (orders?.orders && orders.orders.length > 0) {
      const ordersData = orders.orders.map(order => ({
        order_id: order.orderId,
        buyer_name: order.buyer?.username || 'Unknown',
        total: parseFloat(order.pricingSummary?.total?.value || 0),
        status: order.orderFulfillmentStatus || 'UNKNOWN'
      }));

      const { error: ordersError } = await supabase
        .from('ebay_orders')
        .upsert(ordersData, { onConflict: 'order_id' });

      if (ordersError) {
        console.error('Orders save error:', ordersError);
        throw ordersError;
      }

      console.log('Saved', ordersData.length, 'orders');
    }

    return res.status(200).json({
      success: true,
      message: 'eBay data synced successfully',
      stats: {
        listings: listings?.inventoryItems?.length || 0,
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
