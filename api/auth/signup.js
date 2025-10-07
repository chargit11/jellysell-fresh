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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://jellysell-fresh-6pnt.vercel.app/login'
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup exception:', error);
    return res.status(500).json({ error: error.message });
  }
}
