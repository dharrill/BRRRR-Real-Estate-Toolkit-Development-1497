-- Create MAO Calculations Table
-- Stores maximum allowable offer calculations for properties

CREATE TABLE IF NOT EXISTS mao_calculations_brrrr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties_brrrr(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arv DECIMAL(12,2) NOT NULL,
  rehab_cost DECIMAL(12,2) NOT NULL,
  selected_percentage DECIMAL(5,2) NOT NULL,
  mao_70 DECIMAL(12,2) NOT NULL,
  mao_75 DECIMAL(12,2) NOT NULL,
  mao_80 DECIMAL(12,2) NOT NULL,
  mao_custom DECIMAL(12,2),
  final_mao DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE mao_calculations_brrrr ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own MAO calculations" 
ON mao_calculations_brrrr FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MAO calculations" 
ON mao_calculations_brrrr FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own MAO calculations" 
ON mao_calculations_brrrr FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own MAO calculations" 
ON mao_calculations_brrrr FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mao_calculations_property_id ON mao_calculations_brrrr (property_id);
CREATE INDEX IF NOT EXISTS idx_mao_calculations_user_id ON mao_calculations_brrrr (user_id);
CREATE INDEX IF NOT EXISTS idx_mao_calculations_created_at ON mao_calculations_brrrr (created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mao_calculations_updated_at 
BEFORE UPDATE ON mao_calculations_brrrr 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();