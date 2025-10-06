import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json({ listings: data || [] });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
