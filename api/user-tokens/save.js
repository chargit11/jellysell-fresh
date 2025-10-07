import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTcwOTg3NSwiZXhwIjoyMDc1Mjg1ODc1fQ.YbeG-L6j2atmWo_99qOig3d3NSFtVYA5ZaZnCyN_CPg'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, platform, access_token, refresh_token, token_expiry } = req.body;

    const { error } = await supabase
      .from('user_tokens')
      .upsert({
        user_id,
        platform,
        access_token,
        refresh_token,
        token_expiry: new Date(token_expiry).toISOString()
      }, { onConflict: 'user_id,platform' });

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Save token error:', error);
    return res.status(500).json({ error: error.message });
  }
}
