import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { code, redirect_uri } = await request.json();
    
    const credentials = Buffer.from(
      `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
    ).toString('base64');
    
    const response = await fetch(
      'https://api.ebay.com/identity/v1/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`
      }
    );
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get eBay token' }, { status: 500 });
  }
}
