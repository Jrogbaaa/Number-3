import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This endpoint checks if critical environment variables exist
  // without exposing their actual values
  const envCheck = {
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  // Log for server-side debugging
  console.log('[API:debug-env] Environment variables check:', {
    ...envCheck,
    NEXTAUTH_URL_VALUE: process.env.NEXTAUTH_URL || 'not set'
  });

  return NextResponse.json(envCheck);
} 