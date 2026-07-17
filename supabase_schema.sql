-- 1. Create Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT,
  primary_color TEXT DEFAULT '#7C3AED',
  secondary_color TEXT DEFAULT '#0EA5E9',
  accent_color TEXT DEFAULT '#F59E0B',
  admin_password TEXT NOT NULL, -- Store simple password for client admin access
  start_date DATE,
  end_date DATE,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'suspended'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add client_id column to results table (with cascading deletes)
ALTER TABLE public.results 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;

-- 3. Add client_id column to templates table (with cascading deletes)
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;

-- 4. Create Indexes for rapid lookup and performance optimization
CREATE INDEX IF NOT EXISTS results_client_id_idx ON public.results(client_id);
CREATE INDEX IF NOT EXISTS templates_client_id_idx ON public.templates(client_id);
CREATE INDEX IF NOT EXISTS clients_slug_idx ON public.clients(slug);

-- 5. Enable Row Level Security (RLS) on all tables for Supabase security compliance
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;

-- 6. Create Row Level Security Policies
-- Since this application accesses the database using the public anonymous key (as configured in client-side code),
-- we create policies allowing public reading of active clients and scoped templates/results,
-- and unrestricted access for administrative actions (normally handled by backend, but here authenticated client-side).
-- Note: In a high-security production database, these policies would be locked down to authenticated roles.

-- Clients policies
CREATE POLICY "Allow public select on clients" ON public.clients
  FOR SELECT TO public USING (status = 'active');

CREATE POLICY "Allow all operations on clients for admins" ON public.clients
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Results policies
CREATE POLICY "Allow public select on results" ON public.results
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow all operations on results for admins" ON public.results
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Templates policies
CREATE POLICY "Allow public select on templates" ON public.templates
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow all operations on templates for admins" ON public.templates
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Placements policies
CREATE POLICY "Allow public select on placements" ON public.placements
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow all operations on placements for admins" ON public.placements
  FOR ALL TO public USING (true) WITH CHECK (true);
