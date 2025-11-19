import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return Response.json({ success: false, error: 'Missing user_id' }, { status: 400 });
    }

    // Delete Etsy tokens
    const { error } = await supabase
      .from('etsy_tokens')
      .delete()
      .eq('user_id', user_id);

    if (error) {
      throw error;
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error disconnecting Etsy:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
