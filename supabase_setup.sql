-- Wellness App Supabase Schema Setup
-- Run these SQL commands in your Supabase dashboard to create the database tables

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT UNIQUE NOT NULL,
  profile_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_email TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  date TEXT NOT NULL,
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_check_ins table (aggregated check-ins per user)
CREATE TABLE IF NOT EXISTS user_check_ins (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_email TEXT UNIQUE NOT NULL,
  check_ins JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create bonded_contacts table
CREATE TABLE IF NOT EXISTS bonded_contacts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_email TEXT UNIQUE NOT NULL,
  contacts JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_media table
CREATE TABLE IF NOT EXISTS user_media (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_email TEXT UNIQUE NOT NULL,
  media JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create shared_moments table
CREATE TABLE IF NOT EXISTS shared_moments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_email TEXT UNIQUE NOT NULL,
  shared_moments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  user_email TEXT,
  timestamp TEXT NOT NULL,
  event_date TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create advertiser_credentials table
CREATE TABLE IF NOT EXISTS advertiser_credentials (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  company_name TEXT NOT NULL,
  registered_at TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create featured_ads table
CREATE TABLE IF NOT EXISTS featured_ads (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  partner_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  ad_type TEXT NOT NULL,
  content TEXT NOT NULL,
  title TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  views INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_email ON check_ins(user_email);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(date);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_email);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_advertiser_email ON advertiser_credentials(email);
CREATE INDEX IF NOT EXISTS idx_featured_ads_active ON featured_ads(active);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonded_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_ads ENABLE ROW LEVEL SECURITY;

-- Create policies (basic - allow all for now, strengthen later)
CREATE POLICY "Allow all access" ON user_profiles AS PERMISSIVE FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all access" ON check_ins AS PERMISSIVE FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all access" ON user_check_ins AS PERMISSIVE FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all access" ON bonded_contacts AS PERMISSIVE FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all access" ON user_media AS PERMISSIVE FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all access" ON shared_moments AS PERMISSIVE FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all access" ON analytics_events AS PERMISSIVE FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all access" ON advertiser_credentials AS PERMISSIVE FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all access" ON featured_ads AS PERMISSIVE FOR ALL USING (TRUE) WITH CHECK (TRUE);
