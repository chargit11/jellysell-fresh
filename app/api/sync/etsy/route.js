import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { listings, orders, shop } = await request.json();
    const { db } = await connectToDatabase();
    
    if (listings?.results && listings.results.length > 0) {
      await db.collection('listings').insertMany(
        listings.results.map(item => ({
          ...item,
          platform: 'etsy',
          syncedAt: new Date()
        }))
      );
    }
    
    if (orders?.results && orders.results.length > 0) {
      await db.collection('orders').insertMany(
        orders.results.map(order => ({
          ...order,
          platform: 'etsy',
          syncedAt: new Date()
        }))
      );
    }
    
    return NextResponse.json({ success: true, message: 'Etsy data synced' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync Etsy data' }, { status: 500 });
  }
}
