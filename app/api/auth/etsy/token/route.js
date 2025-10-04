import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { code, code_verifier, redirect_uri } = await request.json();
    
    const response = await fetch(
      'https://api.etsy.com/v3/public/oauth/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.ETSY_KEYSTRING,
          redirect_uri: redirect_uri,
          code: code,
          code_verifier: code_verifier
        })
      }
    );
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get Etsy token' }, { status: 500 });
  }
}
