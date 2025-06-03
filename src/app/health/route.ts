import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check - verify environment is properly configured
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          error: `Missing environment variables: ${missingVars.join(', ')}` 
        },
        { status: 503 }
      );
    }

    // Could add database connectivity check here if needed
    // For now, just return healthy if env vars are present
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || 'unknown'
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 503 }
    );
  }
}

// Support HEAD requests for load balancer health checks
export async function HEAD() {
  try {
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return new Response(null, { status: 503 });
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response(null, { status: 503 });
  }
} 