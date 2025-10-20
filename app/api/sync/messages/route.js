import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

export async function OPTIONS() {
  return new Response(null, { 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function GET() {
  return new Response(JSON.stringify({ test: 'Route is working' }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function POST(request) {
  try {
    const { messages, user_id } = await request.json();
    console.log('Received messages sync request:', { user_id, messageCount: messages?.length });

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (messages && messages.length > 0) {
      const messagesData = messages.map(msg => ({
        user_id: user_id,
        message_id: msg.messageId || `msg_${Date.now()}_${Math.random()}`,
        sender: msg.sender || 'Unknown',
        subject: msg.subject || 'No subject',
        body: msg.body || '',
        read: msg.read || false,
        created_at: msg.createdAt || new Date().toISOString(),
        platform: 'ebay'
      }));

      console.log('Saving messages:', messagesData.length);

      const { error } = await supabase
        .from('ebay_messages')
        .upsert(messagesData, { onConflict: 'message_id' });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Messages saved successfully');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Messages synced successfully',
      count: messages?.length || 0
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error syncing messages:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to sync messages', 
      message: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
