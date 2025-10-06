import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qvhjmzdavsbauugubfcm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('ebay_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json({ listings: data || [] });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
