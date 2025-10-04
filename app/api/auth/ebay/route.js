import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { listings, orders, messages } = await request.json();
    const { db } = await connectToDatabase();
    
    if (listings?.inventoryItems && listings.inventoryItems.length > 0) {
      await db.collection('listings').insertMany(
        listings.inventoryItems.map(item => ({
          ...item,
          platform: 'ebay',
          syncedAt: new Date()
        }))
      );
    }
    
    if (orders?.orders && orders.orders.length > 0) {
      await db.collection('orders').insertMany(
        orders.orders.map(order => ({
          ...order,
          platform: 'ebay',
          syncedAt: new Date()
        }))
      );
    }
    
    return NextResponse.json({ success: true, message: 'eBay data synced' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync eBay data' }, { status: 500 });
  }
}
