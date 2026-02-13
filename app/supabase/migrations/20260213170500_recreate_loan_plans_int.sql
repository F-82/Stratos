-- DESTROY and RECREATE loan_plans table with correct INTEGER ID
BEGIN;

-- 1. Drop the table (CASCADE will drop dependent FKs from loans if they exist)
DROP TABLE IF EXISTS public.loan_plans CASCADE;

-- 2. Create the table from scratch with INTEGER ID
CREATE TABLE public.loan_plans (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    principal_amount NUMERIC NOT NULL,
    duration_months INTEGER NOT NULL,
    interest_rate NUMERIC DEFAULT 0, 
    installment_amount NUMERIC NOT NULL
);

-- 3. Restore Foreign Key in 'loans' table
DO $$
BEGIN
    -- Only try to add the constraint if the 'loans' table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'loans') THEN
        -- Drop if exists just to be safe
        ALTER TABLE public.loans 
        DROP CONSTRAINT IF EXISTS loans_plan_id_fkey;

        -- Add correct FK constraint (Integer to Integer)
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

-- 6. Grant Access explicitly
GRANT ALL ON public.loan_plans TO postgres;
GRANT ALL ON public.loan_plans TO anon;
GRANT ALL ON public.loan_plans TO authenticated;
GRANT ALL ON public.loan_plans TO service_role;

-- 7. Seed Data
INSERT INTO public.loan_plans (name, principal_amount, duration_months, interest_rate, installment_amount)
VALUES ('Starter Loan', 20000, 12, 20, 2000);

COMMIT;
