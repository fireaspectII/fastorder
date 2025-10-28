-- Create function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create tables table for managing restaurant tables
CREATE TABLE public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL UNIQUE CHECK (table_number >= 1 AND table_number <= 50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tables
CREATE POLICY "Anyone can view active tables"
  ON public.tables FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage tables"
  ON public.tables FOR ALL
  USING (auth.role() = 'authenticated');

-- Create trigger for tables updated_at
CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON public.tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial 15 tables
INSERT INTO public.tables (table_number, is_active) 
VALUES 
  (1, true), (2, true), (3, true), (4, true), (5, true),
  (6, true), (7, true), (8, true), (9, true), (10, true),
  (11, true), (12, true), (13, true), (14, true), (15, true);