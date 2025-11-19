import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return Response.json({ connected: false }, { status: 400 });
    }

    // Check if user has Etsy tokens stored
    const { data, error } = await supabase
      .from('etsy_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', user_id)
      .single();

    if (error || !data || !data.access_token) {
      return Response.json({ connected: false }, { status: 200 });
    }

    return Response.json({ connected: true }, { status: 200 });
  } catch (error) {
    console.error('Error checking Etsy connection:', error);
    return Response.json({ connected: false, error: error.message }, { status: 500 });
  }
}
