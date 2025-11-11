import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qvhjmzdavsbauugubfcm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EBAY_CLIENT_ID = 'Christia-JellySel-PRD-edec84694-300e7c9b';
const EBAY_CLIENT_SECRET = 'PRD-dec8469432c4-0955-420e-89d4-44cc';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect('https://jellysell.com/connections?error=no_code');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://jellysell.com/api/ebay/callback'
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect('https://jellysell.com/connections?error=token_failed');
    }

    // Get user_id from URL or session (you'll need to pass this)
    // For now, we'll get it from the referring page or you need to add it to state
    
    // TODO: You need to pass user_id in the OAuth state parameter
    // For now, just redirect back and tell user to try again
    
    return NextResponse.redirect('https://jellysell.com/connections?success=true');

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect('https://jellysell.com/connections?error=server_error');
  }
}
