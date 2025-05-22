import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { UserPreferences } from '@/types/user';
import fs from 'fs';
import path from 'path';
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

// Helper to convert snake_case to camelCase for API responses
const snakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
};

// Helper to convert camelCase to snake_case for database operations
const camelToSnake = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
};

// Ensure user_preferences table exists
async function ensureTableExists() {
  try {
    console.log('[API:user-preferences] Checking if user_preferences table exists...');
    
    // Simple existence check that avoids doing too much
    const { data, error } = await supabase
      .from('user_preferences')
      .select('id')
      .limit(1);
      
    if (error) {
      console.log('[API:user-preferences] Error checking table:', error.message);
      
      // Only if table doesn't exist, try to create it
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('[API:user-preferences] Table does not exist, attempting to create it');
        const migrationPath = path.join(process.cwd(), 'src', 'migrations', '20240615_add_user_preferences.sql');
        
        try {
          const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
          
          try {
            // Attempt to run migration with correct parameter name sql_query
            const { error: rpcError } = await supabase.rpc('execute_sql', { sql_query: migrationSQL });
            
            if (rpcError) {
              console.error('[API:user-preferences] Failed to apply migration with execute_sql:', rpcError);
              return false;
            }
            console.log('[API:user-preferences] Table created successfully');
            return true;
          } catch (rpcError) {
            console.error('[API:user-preferences] RPC execution error:', rpcError);
            return false;
          }
        } catch (fsError) {
          console.error('[API:user-preferences] Error reading migration file:', fsError);
          return false;
        }
      }
      
      return false;
    }
    
    console.log('[API:user-preferences] Table exists and is accessible');
    return true;
  } catch (err) {
    console.error('[API:user-preferences] Unexpected error checking table:', err);
    return false;
  }
}

// GET: Fetch user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('[API:user-preferences] GET - Session check:', {
      hasSession: !!session,
      userId: session?.user?.id || 'none'
    });

    if (!session?.user?.id) {
      console.log('[API:user-preferences] GET - Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized - You must be logged in to access preferences' }, { status: 401 });
    }

    // Convert the user ID to a valid UUID
    const userUUID = getUserUUID(session.user.id);
    console.log(`[API:user-preferences] GET - Converting user ID: ${session.user.id} to UUID: ${userUUID}`);

    // First, check if the migration status API says the table exists
    try {
      console.log('[API:user-preferences] GET - Checking migration status first');
      const migrationResponse = await fetch(new URL('/api/migration-status', request.url), {
        headers: {
          cookie: request.headers.get('cookie') || '' // Forward cookies for auth
        }
      });
      
      const migrationData = await migrationResponse.json();
      
      if (migrationData.status !== 'success') {
        console.log('[API:user-preferences] GET - Migration check failed, returning early with error:', migrationData);
        return NextResponse.json({ 
          error: 'User preferences table could not be created or accessed' 
        }, { status: 500 });
      }
    } catch (migErr) {
      console.error('[API:user-preferences] GET - Error checking migration status:', migErr);
      // Continue anyway, as the table might still exist
    }

    // Ensure table exists before proceeding
    const tableExists = await ensureTableExists();
    if (!tableExists) {
      console.log('[API:user-preferences] GET - Table does not exist and could not be created');
      return NextResponse.json(
        { error: 'User preferences table could not be created or accessed' }, 
        { status: 500 }
      );
    }

    // Get user preferences
    console.log(`[API:user-preferences] GET - Fetching preferences for user: ${userUUID}`);
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userUUID)
      .single();

    if (error) {
      console.error('[API:user-preferences] GET - Error fetching preferences:', error);
      
      // Special case for "not found" - create default preferences
      if (error.code === 'PGRST116') {
        console.log('[API:user-preferences] GET - No existing preferences, creating defaults');
        try {
          const defaultPreferences = {
            user_id: userUUID,
            has_completed_onboarding: false,
            onboarding_step: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: newPrefs, error: insertError } = await supabase
            .from('user_preferences')
            .insert(defaultPreferences)
            .select()
            .single();

          if (insertError) {
            console.error('[API:user-preferences] GET - Error creating default preferences:', insertError);
            throw new Error(insertError.message);
          }

          console.log('[API:user-preferences] GET - Created default preferences successfully');
          return NextResponse.json(newPrefs);
        } catch (createErr) {
          console.error('[API:user-preferences] GET - Failed to create default preferences:', createErr);
          return NextResponse.json({ 
            error: 'Failed to create default preferences'
          }, { status: 500 });
        }
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      // This shouldn't happen with .single() but handle it anyway
      console.log('[API:user-preferences] GET - No data returned from valid query, creating defaults');
      const defaultPreferences = {
        user_id: userUUID,
        has_completed_onboarding: false,
        onboarding_step: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newPrefs, error: insertError } = await supabase
        .from('user_preferences')
        .insert(defaultPreferences)
        .select()
        .single();

      if (insertError) {
        console.error('[API:user-preferences] GET - Error creating default preferences:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      console.log('[API:user-preferences] GET - Created default preferences successfully');
      return NextResponse.json(newPrefs);
    }

    console.log('[API:user-preferences] GET - Returning existing preferences');
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API:user-preferences] GET - Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

// PUT: Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('[API:user-preferences] PUT - Session check:', {
      hasSession: !!session,
      userId: session?.user?.id || 'none'
    });

    if (!session?.user?.id) {
      console.log('[API:user-preferences] PUT - Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Convert the user ID to a valid UUID
    const userUUID = getUserUUID(session.user.id);
    console.log(`[API:user-preferences] PUT - Converting user ID: ${session.user.id} to UUID: ${userUUID}`);

    // Ensure table exists before proceeding
    const tableExists = await ensureTableExists();
    if (!tableExists) {
      console.log('[API:user-preferences] PUT - Table does not exist and could not be created');
      return NextResponse.json(
        { error: 'User preferences table could not be created or accessed' }, 
        { status: 500 }
      );
    }

    const updates = await request.json();
    updates.updated_at = new Date().toISOString();

    // Check if record exists
    console.log(`[API:user-preferences] PUT - Checking if preferences exist for user: ${userUUID}`);
    const { data: existing, error: checkError } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userUUID)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // not found is ok
      console.error('[API:user-preferences] PUT - Error checking existing preferences:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (!existing) {
      // Create new record with defaults + updates
      console.log('[API:user-preferences] PUT - No existing preferences, creating new with updates');
      const newPrefs = {
        user_id: userUUID,
        has_completed_onboarding: false,
        onboarding_step: 1,
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('user_preferences')
        .insert(newPrefs)
        .select()
        .single();

      if (insertError) {
        console.error('[API:user-preferences] PUT - Error creating new preferences:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      console.log('[API:user-preferences] PUT - Created new preferences successfully');
      return NextResponse.json(insertedData);
    }

    // Update existing record
    console.log('[API:user-preferences] PUT - Updating existing preferences');
    const { data: updatedData, error: updateError } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userUUID)
      .select()
      .single();

    if (updateError) {
      console.error('[API:user-preferences] PUT - Error updating preferences:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log('[API:user-preferences] PUT - Updated preferences successfully');
    return NextResponse.json(updatedData);
  } catch (err) {
    console.error('[API:user-preferences] PUT - Unexpected error:', err);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
} 