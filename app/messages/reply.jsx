// pages/api/messages/reply.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvhjmzdavsbauugubfcm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message_id, message, user_id } = req.body;

  if (!message_id || !message || !user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Store the reply in your database
    const { data, error } = await supabase.from('message_replies').insert({
      message_id,
      user_id,
      reply_text: message,
      sent_at: new Date().toISOString()
    });

    if (error) throw error;

    // For now, we'll just log the reply rather than actually sending to eBay
    console.log('Reply stored:', { message_id, message, user_id });

    return res.status(200).json({
      success: true,
      data: { 
        message_id,
        status: 'Reply saved - sending is not yet implemented'
      }
    });
  } catch (error) {
    console.error('Error saving reply:', error);
    return res.status(500).json({ error: 'Failed to save reply' });
  }
}
