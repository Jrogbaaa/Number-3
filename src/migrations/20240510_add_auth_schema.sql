-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create accounts table for OAuth providers
CREATE TABLE IF NOT EXISTS auth.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  oauth_token_secret TEXT,
  oauth_token TEXT,
  UNIQUE(provider, provider_account_id)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS auth.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  session_token TEXT NOT NULL UNIQUE
);

-- Create verification_tokens table (for email verification)
CREATE TABLE IF NOT EXISTS auth.verification_tokens (
  token TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL
);

-- Add RLS policies
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read their own data" 
  ON auth.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create policy to allow users to read their own accounts
CREATE POLICY "Users can read their own accounts" 
  ON auth.accounts 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create policy to allow users to read their own sessions
CREATE POLICY "Users can read their own sessions" 
  ON auth.sessions 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users(email);
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON auth.accounts(user_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_session_token_idx ON auth.sessions(session_token);
CREATE INDEX IF NOT EXISTS verification_tokens_token_idx ON auth.verification_tokens(token); 