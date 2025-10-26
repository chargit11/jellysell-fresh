import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

export async function GET(request) {
  try {
    const { data: messages, error } = await supabase
      .from('ebay_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group messages by sender to create conversations
    const conversations = [];
    const senderMap = new Map();

    messages.forEach(msg => {
      const sender = msg.sender || 'eBay User';
      if (!senderMap.has(sender)) {
        senderMap.set(sender, {
          sender: sender,
          subject: msg.subject,
          created_at: msg.created_at,
          message_count: 1
        });
        conversations.push(senderMap.get(sender));
      } else {
        senderMap.get(sender).message_count++;
      }
    });

    return NextResponse.json({ messages: conversations });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
