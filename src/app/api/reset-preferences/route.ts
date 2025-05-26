import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { v5 } from 'uuid';

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// UUID namespace for consistent ID generation
const UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

// Helper to convert non-UUID user IDs to valid UUIDs
const getUserUUID = (userId: string): string => {
  // Check if the ID is already a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(userId)) {
    return userId;
  }
  
  // Otherwise, generate a deterministic UUID based on the original ID
  return v5(userId, UUID_NAMESPACE);
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('[API:reset-preferences] Session check:', {
      hasSession: !!session,
      userId: session?.user?.id || 'none'
    });

    if (!session?.user?.id) {
      console.log('[API:reset-preferences] Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert the user ID to a valid UUID
    const userUUID = getUserUUID(session.user.id);
    console.log(`[API:reset-preferences] Converting user ID: ${session.user.id} to UUID: ${userUUID}`);

    // Delete existing preferences
    console.log(`[API:reset-preferences] Deleting existing preferences for user: ${userUUID}`);
    const { error: deleteError } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userUUID);

    if (deleteError) {
      console.error('[API:reset-preferences] Error deleting preferences:', deleteError);
      // Continue anyway, maybe the record didn't exist
    }

    // Clear localStorage on the client side by returning a flag
    console.log('[API:reset-preferences] Preferences reset successfully');
    return NextResponse.json({ 
      success: true,
      message: 'User preferences have been reset. Please refresh the page and redo your onboarding.',
      clearLocalStorage: true
    });

  } catch (err) {
    console.error('[API:reset-preferences] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to reset user preferences' },
      { status: 500 }
    );
  }
} 