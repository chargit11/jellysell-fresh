import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qvhjmzdavsbauugubfcm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw'
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect('https://jellysell-fresh-6pnt.vercel.app/?error=no_code');
    }
    
    const clientId = '660936755080-qh2ogr42qc5j63e1p43mnmc2dioc8gbd.apps.googleusercontent.com';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET; // Add this to Vercel environment variables
    const redirectUri = 'https://jellysell-fresh-6pnt.vercel.app/api/auth/google/callback';
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    const tokens = await tokenResponse.json();
    
    if (tokens.error) {
      return NextResponse.redirect(`https://jellysell-fresh-6pnt.vercel.app/?error=${tokens.error}`);
    }
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    
    const googleUser = await userResponse.json();
    
    // Check if user exists in Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', googleUser.email)
      .single();
    
    let userId;
    
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: googleUser.email,
          name: googleUser.name,
          profile_picture: googleUser.picture,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        return NextResponse.redirect('https://jellysell-fresh-6pnt.vercel.app/?error=user_creation_failed');
      }
      
      userId = newUser.id;
    }
    
    // Create session with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: tokens.id_token,
    });
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.redirect('https://jellysell-fresh-6pnt.vercel.app/?error=auth_failed');
    }
    
    // Redirect to dashboard with session
    const response = NextResponse.redirect('https://jellysell-fresh-6pnt.vercel.app/dashboard');
    
    if (authData.session) {
      response.cookies.set('sb-access-token', authData.session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
      
      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
    }
    
    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect('https://jellysell-fresh-6pnt.vercel.app/?error=callback_failed');
  }
}
