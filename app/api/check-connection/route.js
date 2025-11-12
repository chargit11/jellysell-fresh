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
    console.log('CHECK CONNECTION - user_id received:', user_id);

    if (!user_id) {
      console.log('CHECK CONNECTION - No user_id provided');
      return NextResponse.json({ connected: false, error: 'No user_id provided' }, { status: 400 });
    }

    // Check if user has eBay tokens in user_tokens table
    console.log('CHECK CONNECTION - Querying Supabase for user_id:', user_id, 'platform: ebay');
    
    const { data, error } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', user_id)
      .eq('platform', 'ebay')
      .single();

    console.log('CHECK CONNECTION - Supabase query result:', { data, error });

    if (error) {
      console.error('CHECK CONNECTION - Error checking eBay connection:', error);
      return NextResponse.json({ connected: false, debug: { error: error.message } });
    }

    if (!data) {
      console.log('CHECK CONNECTION - No data found');
      return NextResponse.json({ connected: false, debug: { reason: 'no_data' } });
    }

    // Check if token exists and is not expired
    const tokenExpiry = new Date(data.token_expiry);
    const now = new Date();
    console.log('CHECK CONNECTION - Token expiry:', tokenExpiry);
    console.log('CHECK CONNECTION - Current time:', now);
    console.log('CHECK CONNECTION - Token expired?', tokenExpiry <= now);
    
    const connected = data && data.access_token && tokenExpiry > now;
    console.log('CHECK CONNECTION - Final result:', connected);

    return NextResponse.json({ 
      connected,
      debug: {
        has_data: !!data,
        has_access_token: !!data?.access_token,
        token_expiry: data?.token_expiry,
        is_expired: tokenExpiry <= now
      }
    });
  } catch (error) {
    console.error('CHECK CONNECTION - Error in check-connection:', error);
    return NextResponse.json({ connected: false, error: error.message }, { status: 500 });
  }
}
