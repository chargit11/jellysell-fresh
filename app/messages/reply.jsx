import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create Supabase client
const supabaseUrl = 'https://qvhjmzdavsbauugubfcm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const body = await request.json();
    const { message_id, reply_text, user_id } = body;

    if (!message_id || !reply_text || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Store the reply in Supabase
    const { data, error } = await supabase
      .from('message_replies')
      .insert([
        { 
          message_id,
          user_id,
          reply_text,
          sent_at: new Date().toISOString(),
          status: 'pending'
        }
      ]);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { 
        message_id,
        status: 'Reply saved'
      }
    });
  } catch (error) {
    console.error('Error saving reply:', error);
    return NextResponse.json({ error: 'Failed to save reply' }, { status: 500 });
  }
}
