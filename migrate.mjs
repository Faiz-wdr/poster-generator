// Full Supabase schema migration script
// Creates all tables, storage buckets, and RLS policies

const SUPABASE_URL = 'https://ojtzjiosapraquwxvere.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdHpqaW9zYXByYXF1d3h2ZXJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgwNDE0NiwiZXhwIjoyMDk1MzgwMTQ2fQ.obArrfSNXq28vHTrtS2CX5LbG9AUk68V13ibFhnsVJI';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Prefer': 'return=minimal',
};

const SQL_MIGRATION = `
-- ============================================================
-- CLIENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  primary_color TEXT DEFAULT '#7C3AED',
  secondary_color TEXT DEFAULT '#0EA5E9',
  accent_color TEXT DEFAULT '#F59E0B',
  admin_password TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  expiry_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  programs JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RESULTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  category TEXT,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PLACEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
  position TEXT,
  name TEXT,
  team TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TEMPLATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  background TEXT,
  fields JSONB DEFAULT '[]'::jsonb,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_results_client_id ON public.results(client_id);
CREATE INDEX IF NOT EXISTS idx_placements_result_id ON public.placements(result_id);
CREATE INDEX IF NOT EXISTS idx_templates_client_id ON public.templates(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON public.clients(slug);

-- ============================================================
-- ENABLE RLS (security)
-- ============================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Allow full access for service_role (bypasses RLS automatically)
-- Allow anon read access for public event pages
CREATE POLICY IF NOT EXISTS "anon_read_clients" ON public.clients FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS "anon_read_results" ON public.results FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS "anon_read_placements" ON public.placements FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS "anon_read_templates" ON public.templates FOR SELECT TO anon USING (true);
`;

// Since we can't execute DDL via PostgREST, we'll output the SQL
// and try to set up storage buckets (which CAN be done via the API)
async function setupStorageBuckets() {
  console.log('📦 Setting up storage buckets...\n');

  const buckets = ['template-backgrounds', 'logos'];

  for (const bucket of buckets) {
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: bucket,
          name: bucket,
          public: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`  ✅ Bucket '${bucket}' created successfully`);
      } else if (data.message?.includes('already exists')) {
        console.log(`  ℹ️  Bucket '${bucket}' already exists`);
      } else {
        console.log(`  ❌ Bucket '${bucket}' error:`, data.message || data);
      }
    } catch (e) {
      console.log(`  ❌ Bucket '${bucket}' exception:`, e.message);
    }
  }
}

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    if (res.ok) {
      console.log('  ✅ Connection successful!\n');
      return true;
    } else {
      console.log(`  ❌ Connection failed: ${res.status} ${res.statusText}\n`);
      return false;
    }
  } catch (e) {
    console.log(`  ❌ Connection error: ${e.message}\n`);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Result Poster — Supabase Migration Script');
  console.log('═══════════════════════════════════════════════════════\n');

  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Cannot connect to Supabase. Check your URL and keys.');
    process.exit(1);
  }

  // 1. Setup storage buckets (works via REST API)
  await setupStorageBuckets();

  // 2. Output SQL for manual execution
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ⚠️  TABLE CREATION REQUIRES THE SQL EDITOR');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\nThe service_role key cannot run DDL (CREATE TABLE) via');
  console.log('the REST API. Please copy the SQL below and run it in');
  console.log('your Supabase Dashboard SQL Editor:\n');
  console.log('  🔗 https://supabase.com/dashboard/project/ojtzjiosapraquwxvere/sql/new\n');
  console.log('────────── COPY FROM HERE ──────────');
  console.log(SQL_MIGRATION);
  console.log('────────── COPY TO HERE ──────────\n');
  console.log('After running the SQL, your app will be fully connected!\n');
}

main().catch(console.error);
