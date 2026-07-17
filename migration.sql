-- ============================================================
-- STEP 1: FORCE DROP EXISTING TABLES AND DEPENDENCIES
-- ============================================================
DROP TABLE IF EXISTS public.placements CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.results CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- ============================================================
-- STEP 2: CREATE NEW TABLES
-- ============================================================

CREATE TABLE public.clients (
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
  teams JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  category TEXT,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
  position TEXT,
  name TEXT,
  team TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  background TEXT,
  fields JSONB DEFAULT '[]'::jsonb,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 3: CREATE INDEXES
-- ============================================================

CREATE INDEX idx_results_client_id ON public.results(client_id);
CREATE INDEX idx_placements_result_id ON public.placements(result_id);
CREATE INDEX idx_templates_client_id ON public.templates(client_id);
CREATE INDEX idx_clients_slug ON public.clients(slug);

-- ============================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 5: CREATE RLS POLICIES (Allow ALL access for the anon key)
-- ============================================================

CREATE POLICY "anon_all_clients" ON public.clients FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_results" ON public.results FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_placements" ON public.placements FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_templates" ON public.templates FOR ALL TO anon USING (true) WITH CHECK (true);
