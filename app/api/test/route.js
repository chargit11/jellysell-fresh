import { NextResponse } from 'next/server';

export async function POST(request) {
  return NextResponse.json({ message: 'IT WORKS!' });
}

export async function GET(request) {
  return NextResponse.json({ message: 'GET WORKS!' });
}
