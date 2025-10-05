// API endpoint to receive Etsy data from extension
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shop, listings, orders } = req.body;

    console.log('Received Etsy data:');
    console.log('Shop:', shop?.results?.[0]?.shop_name || 'Unknown');
    console.log('Listings:', listings?.results?.length || 0);
    console.log('Orders:', orders?.results?.length || 0);

    // TODO: Store this data in your database
    // For now, we'll just log it and return success
    
    // Example of what you'd do with a database:
    // await db.etsyShop.upsert({ data: shop.results[0] });
    // await db.etsyListings.createMany({ data: listings.results });
    // await db.etsyOrders.createMany({ data: orders.results });

    return res.status(200).json({
      success: true,
      message: 'Etsy data received',
      stats: {
        shop: shop?.results?.[0]?.shop_name || null,
        listings: listings?.results?.length || 0,
        orders: orders?.results?.length || 0
      }
    });

  } catch (error) {
    console.error('Error processing Etsy sync:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
