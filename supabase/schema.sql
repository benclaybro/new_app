-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.follow_ups;
DROP TABLE IF EXISTS public.consultations;

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  consultant_id UUID REFERENCES public.users(id),
  assigned_to UUID REFERENCES public.users(id),
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  type TEXT NOT NULL CHECK (type IN ('consultation', 'follow_up')),
  contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  qualification_answers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to consultations table
DROP TRIGGER IF EXISTS set_updated_at ON public.consultations;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add RLS policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.consultations;
CREATE POLICY "Enable read access for authenticated users" ON public.consultations
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.consultations;
CREATE POLICY "Enable insert for authenticated users" ON public.consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for assigned users" ON public.consultations;
CREATE POLICY "Enable update for assigned users" ON public.consultations
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = consultant_id OR 
    auth.uid() = assigned_to
  );