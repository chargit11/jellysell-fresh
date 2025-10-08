import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { listing_id, user_id } = req.body;

    if (!listing_id || !user_id) {
      return res.status(400).json({ error: 'listing_id and user_id required' });
    }

    const { error } = await supabase
      .from('ebay_listings')
      .delete()
      .eq('listing_id', listing_id)
      .eq('user_id', user_id);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return res.status(500).json({ 
      error: 'Failed to delete listing',
      message: error.message 
    });
  }
}
