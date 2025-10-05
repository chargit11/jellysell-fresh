// API endpoint to receive eBay data from extension
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { listings, orders } = req.body;

    console.log('Received eBay data:');
    console.log('Listings:', listings?.inventoryItems?.length || 0);
    console.log('Orders:', orders?.orders?.length || 0);

    // TODO: Store this data in your database
    // For now, we'll just log it and return success
    
    // Example of what you'd do with a database:
    // await db.ebayListings.createMany({ data: listings.inventoryItems });
    // await db.ebayOrders.createMany({ data: orders.orders });

    return res.status(200).json({
      success: true,
      message: 'eBay data received',
      stats: {
        listings: listings?.inventoryItems?.length || 0,
        orders: orders?.orders?.length || 0
      }
    });

  } catch (error) {
    console.error('Error processing eBay sync:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
