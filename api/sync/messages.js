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
    const { messages, user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    if (messages && messages.length > 0) {
      const messagesData = messages.map(msg => ({
        user_id: user_id,
        message_id: msg.messageId || `msg_${Date.now()}_${Math.random()}`,
        sender: msg.sender || 'Unknown',
        subject: msg.subject || 'No subject',
        body: msg.body || '',
        read: msg.read || false,
        platform: 'ebay'
      }));

      const { error } = await supabase
        .from('ebay_messages')
        .upsert(messagesData, { onConflict: 'message_id' });

      if (error) throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Messages synced successfully',
      count: messages?.length || 0
    });
  } catch (error) {
    console.error('Error syncing messages:', error);
    return res.status(500).json({ 
      error: 'Failed to sync messages',
      message: error.message 
    });
  }
}
