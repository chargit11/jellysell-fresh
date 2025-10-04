import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { refresh_token } = await request.json();
    
    const response = await fetch(
      'https://api.etsy.com/v3/public/oauth/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: process.env.ETSY_KEYSTRING,
          refresh_token: refresh_token
        })
      }
    );
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to refresh Etsy token' }, { status: 500 });
  }
}
