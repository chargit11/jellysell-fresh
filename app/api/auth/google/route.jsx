import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = '660936755080-qh2ogr42qc5j63e1p43mnmc2dioc8gbd.apps.googleusercontent.com';
  const redirectUri = 'https://jellysell-fresh-6pnt.vercel.app/api/auth/google/callback';
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&access_type=offline&prompt=consent`;
  
  return NextResponse.redirect(googleAuthUrl);
}
