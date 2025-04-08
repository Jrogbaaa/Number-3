import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createLeadsTable() {
  try {
    const { error } = await supabase.rpc('create_leads_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS leads (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT,
          email TEXT UNIQUE NOT NULL,
          company TEXT,
          title TEXT,
          score INTEGER DEFAULT 0,
          source TEXT,
          status TEXT DEFAULT 'new',
          value DECIMAL(10,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          last_contacted_at TIMESTAMP WITH TIME ZONE,
          insights JSONB DEFAULT '{}'::jsonb,
          metadata JSONB DEFAULT '{}'::jsonb
        );

        CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
        CREATE INDEX IF NOT EXISTS leads_score_idx ON leads(score);
        CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
        CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);
      `
    });

    if (error) {
      throw error;
    }

    console.log('Leads table created successfully');
  } catch (error) {
    console.error('Error creating leads table:', error);
    process.exit(1);
  }
}

createLeadsTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 