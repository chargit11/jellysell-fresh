// app/api/ebay/check-connection/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ connected: false, error: 'No user_id provided' }, { status: 400 });
    }

    // Check if user has eBay tokens in user_tokens table
    const { data, error } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', user_id)
      .eq('platform', 'ebay')
      .single();

    if (error) {
      console.error('Error checking eBay connection:', error);
      return NextResponse.json({ connected: false });
    }

    // Check if token exists and is not expired
    const connected = data && data.access_token && new Date(data.token_expiry) > new Date();

    return NextResponse.json({ connected });
  } catch (error) {
    console.error('Error in check-connection:', error);
    return NextResponse.json({ connected: false, error: error.message }, { status: 500 });
  }
}
