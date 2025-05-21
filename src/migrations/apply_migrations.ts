import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// ESM module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSql(sql: string): Promise<any> {
  const { data, error } = await supabase
    .from('_migrations')
    .insert({
      sql,
      executed_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(`SQL execution failed: ${JSON.stringify(error)}`);
  }

  return data;
}

async function applyMigrations() {
  try {
    // Create migrations table first
    const createMigrationsTableSql = `
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        sql TEXT NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Enable RLS on migrations table
      ALTER TABLE _migrations ENABLE ROW LEVEL SECURITY;

      -- Create policy for service role to manage migrations
      CREATE POLICY "Allow service role to manage migrations"
      ON _migrations
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    `;

    try {
      await supabase.rpc('exec', { sql: createMigrationsTableSql });
    } catch (error) {
      console.warn('Migration table might already exist:', error);
    }

    // Read all SQL files in the migrations directory
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure consistent order

    console.log('Found migration files:', files);

    // Apply each migration
    for (const file of files) {
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      try {
        await supabase.rpc('exec', { sql });
        console.log(`Successfully applied migration: ${file}`);
      } catch (error) {
        console.error(`Error applying migration ${file}:`, error);
        throw error;
      }
    }

    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

// Run migrations
applyMigrations(); 