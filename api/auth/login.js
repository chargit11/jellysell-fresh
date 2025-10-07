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
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: error.message });
    }

    console.log('Login successful for user:', data.user.id);

    return res.status(200).json({ 
      user_id: data.user.id,
      email: data.user.email 
    });
  } catch (error) {
    console.error('Login exception:', error);
    return res.status(500).json({ error: error.message });
  }
}
