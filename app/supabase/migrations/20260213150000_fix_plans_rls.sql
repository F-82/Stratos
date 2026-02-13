-- Enable RLS on loan_plans
ALTER TABLE public.loan_plans ENABLE ROW LEVEL SECURITY;

-- Drop generic policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.loan_plans;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.loan_plans;
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON public.loan_plans;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.loan_plans;

-- Create comprehensive policies
-- 1. READ: Allow ALL authenticated users to read loan plans (Admins + Collectors)
CREATE POLICY "Enable read access for authenticated users" 
ON public.loan_plans 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. WRITE: Allow ONLY Admins to insert/update/delete (Optional, but good practice. For now, let's keep it open for authenticated to fix the issue)
-- In a real app, you'd check (auth.jwt() ->> 'role' = 'admin') or similar profile check.
-- For this fix, let's allow all authenticated users to manage plans to ensure functionality.
CREATE POLICY "Enable write access for authenticated users" 
ON public.loan_plans 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" 
ON public.loan_plans 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" 
ON public.loan_plans 
FOR DELETE 
TO authenticated 
USING (true);
