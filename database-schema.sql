-- ============================================
-- SUPABASE MULTI-TENANT SAAS STARTER
-- Database Schema
-- ============================================
-- 
-- This schema provides a complete foundation for
-- a multi-tenant B2B SaaS application with:
-- 
-- ✅ Organizations (tenants)
-- ✅ User profiles with roles
-- ✅ Row Level Security (RLS)
-- ✅ Generic records table
-- ✅ Automatic timestamps
-- 
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ENABLE EXTENSIONS
-- ============================================

-- UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- --------------------------------------------
-- Organizations Table
-- Each organization is a separate tenant
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE organizations IS 'Stores tenant/organization information for multi-tenancy';
COMMENT ON COLUMN organizations.name IS 'Organization display name';

-- --------------------------------------------
-- Profiles Table
-- Links auth.users to organizations with roles
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  -- Links to Supabase auth.users
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User info
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  
  -- Organization & role
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

COMMENT ON TABLE profiles IS 'User profiles linked to auth.users with organization membership';
COMMENT ON COLUMN profiles.role IS 'User role: admin (full access), member (read/write), viewer (read only)';
COMMENT ON COLUMN profiles.organization_id IS 'Which organization this user belongs to';

-- --------------------------------------------
-- Records Table
-- Generic table for storing tenant data
-- Customize this based on your needs
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Ownership
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Data fields (customize these!)
  title TEXT NOT NULL,
  description TEXT,
  data JSONB, -- Flexible JSON storage
  
  -- Status workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE records IS 'Generic records table - customize fields for your use case';
COMMENT ON COLUMN records.data IS 'Flexible JSONB field for storing custom data structure';
COMMENT ON COLUMN records.status IS 'Workflow status: pending → approved/rejected';

-- ============================================
-- 3. CREATE INDEXES
-- ============================================
-- Indexes speed up queries on frequently searched columns

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_organization 
  ON profiles(organization_id);
  
CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON profiles(email);
  
CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON profiles(role);

-- Records indexes
CREATE INDEX IF NOT EXISTS idx_records_organization 
  ON records(organization_id);
  
CREATE INDEX IF NOT EXISTS idx_records_created_by 
  ON records(created_by);
  
CREATE INDEX IF NOT EXISTS idx_records_status 
  ON records(status);
  
CREATE INDEX IF NOT EXISTS idx_records_created_at 
  ON records(created_at DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- RLS ensures users can only see their organization's data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------
-- Profiles Policies
-- --------------------------------------------

-- Users can view their own profile
CREATE POLICY "users_view_own_profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own_profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles in their organization
CREATE POLICY "admins_view_org_profiles"
  ON profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can create new profiles in their organization
CREATE POLICY "admins_create_org_profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete profiles in their organization
CREATE POLICY "admins_delete_org_profiles"
  ON profiles FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --------------------------------------------
-- Organizations Policies
-- --------------------------------------------

-- Users can view their own organization
CREATE POLICY "users_view_own_organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Admins can update their organization
CREATE POLICY "admins_update_organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --------------------------------------------
-- Records Policies
-- --------------------------------------------

-- Users can view records in their organization
CREATE POLICY "users_view_org_records"
  ON records FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Members and admins can create records
CREATE POLICY "members_create_records"
  ON records FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'member')
    )
  );

-- Members and admins can update records in their org
CREATE POLICY "members_update_records"
  ON records FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'member')
    )
  );

-- Only admins can delete records
CREATE POLICY "admins_delete_records"
  ON records FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- --------------------------------------------
-- Auto-update updated_at timestamp
-- --------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at timestamp on row update';

-- Attach trigger to tables
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_records_updated_at 
  BEFORE UPDATE ON records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. HELPER FUNCTIONS (Optional)
-- ============================================

-- --------------------------------------------
-- Get current user's organization
-- --------------------------------------------
CREATE OR REPLACE FUNCTION get_my_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

COMMENT ON FUNCTION get_my_organization_id() IS 'Returns the organization_id of the currently authenticated user';

-- --------------------------------------------
-- Check if current user is admin
-- --------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

COMMENT ON FUNCTION is_admin() IS 'Returns true if current user has admin role';

-- ============================================
-- 7. SEED DATA (Optional - for testing)
-- ============================================
-- Uncomment to create sample data

/*
-- Create a sample organization
INSERT INTO organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Organization')
ON CONFLICT (id) DO NOTHING;

-- Note: You'll create actual users through the signup flow
-- This is just for reference
*/

-- ============================================
-- 8. VERIFICATION
-- ============================================
-- Run this to verify everything was created

SELECT 
  'Tables created:' as check_type,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('organizations', 'profiles', 'records');

SELECT 
  'Indexes created:' as check_type,
  COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public';

SELECT 
  'RLS policies created:' as check_type,
  COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

SELECT 
  'Functions created:' as check_type,
  COUNT(*) as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('update_updated_at_column', 'get_my_organization_id', 'is_admin');

-- If you see counts > 0 for all, you're good! ✅

-- ============================================
-- SETUP COMPLETE! 🎉
-- ============================================
-- 
-- Next steps:
-- 1. Go to your app and create your first account
-- 2. Check the profiles table to see your user
-- 3. Start building your features!
-- 
-- ============================================
