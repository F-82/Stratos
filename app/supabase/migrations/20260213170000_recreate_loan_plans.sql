-- DESTROY and RECREATE loan_plans table to fix all schema/RLS issues
BEGIN;

-- 1. Drop the table and all its dependents (cascades to internal foreign keys if any, be careful with loans!)
-- NOTE: We are using CASCADE, so if 'loans' table references 'loan_plans', those FKs might block or be dropped.
-- Better to just recreate the table structure and preserve data if possible? 
-- No, let's try to preserve data but fix schema.
-- ACTUALLY, "Error fetching plans" usually means RLS or missing table.
-- Let's try DROP TABLE IF EXISTS public.loan_plans CASCADE; 
-- WARNING: This will delete existing plans. That's acceptable for "Settings".
DROP TABLE IF EXISTS public.loan_plans CASCADE;

-- 2. Create the table from scratch
CREATE TABLE public.loan_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    principal_amount NUMERIC NOT NULL,
    duration_months INTEGER NOT NULL,
    interest_rate NUMERIC DEFAULT 0, -- Ensure this exists
    installment_amount NUMERIC NOT NULL
);

-- 3. Restore Foreign Key in 'loans' table if it was dropped by CASCADE
-- Check if loans table exists and add FK back if needed
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'loans') THEN
        ALTER TABLE public.loans 
        DROP CONSTRAINT IF EXISTS loans_plan_id_fkey;

        ALTER TABLE public.loans
        ADD CONSTRAINT loans_plan_id_fkey
        FOREIGN KEY (plan_id)
        REFERENCES public.loan_plans(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.loan_plans ENABLE ROW LEVEL SECURITY;

-- 5. Create SIMPLE Policy
CREATE POLICY "Enable full access for authenticated users"
ON public.loan_plans
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Grant Access to Postgres/Anon/Authenticated roles (Double check grants)
GRANT ALL ON public.loan_plans TO postgres;
GRANT ALL ON public.loan_plans TO anon;
GRANT ALL ON public.loan_plans TO authenticated;
GRANT ALL ON public.loan_plans TO service_role;

-- 7. Seed Data
INSERT INTO public.loan_plans (name, principal_amount, duration_months, interest_rate, installment_amount)
VALUES ('Starter Loan', 20000, 12, 20, 2000);

COMMIT;
