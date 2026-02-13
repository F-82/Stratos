-- Force fix for loan_plans RLS and Data
BEGIN;

-- 1. Ensure RLS is enabled
ALTER TABLE public.loan_plans ENABLE ROW LEVEL SECURITY;

-- 2. Drop legacy policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.loan_plans;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.loan_plans;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.loan_plans;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.loan_plans;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.loan_plans;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.loan_plans;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.loan_plans;
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON public.loan_plans;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.loan_plans;

-- 3. Create a single, simple policy for ALL operations for authenticated users
CREATE POLICY "Enable all access for authenticated users"
ON public.loan_plans
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Seed a default plan if none exists
INSERT INTO public.loan_plans (name, principal_amount, duration_months, interest_rate, installment_amount)
SELECT 'Starter Loan', 20000, 12, 20, 2000
WHERE NOT EXISTS (SELECT 1 FROM public.loan_plans);

COMMIT;
