-- Fix Borrowers FK to allow collector deletion
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Check references for collector_id
    -- We'll try to drop the constraint if it exists. 
    -- The exact name might vary, so we search for constraints on borrowers.collector_id
    FOR r IN 
        SELECT con.conname
        FROM pg_catalog.pg_constraint con
        JOIN pg_catalog.pg_attribute a ON a.attnum = ANY(con.conkey)
        WHERE con.conrelid = 'public.borrowers'::regclass
        AND a.attname = 'collector_id'
        AND con.contype = 'f'
    LOOP
        EXECUTE 'ALTER TABLE public.borrowers DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;

    -- Add back with ON DELETE SET NULL
    ALTER TABLE public.borrowers 
    ADD CONSTRAINT borrowers_collector_id_fkey 
    FOREIGN KEY (collector_id) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;
END $$;

-- Ensure Loan Plans are visible (Fix fetchPlans error)
-- Enable RLS
ALTER TABLE IF EXISTS public.loan_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read for Authenticated users (or just admins, but let's be broad for debugging)
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON public.loan_plans;
CREATE POLICY "Allow read access for all authenticated users" 
ON public.loan_plans 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy to allow insert/update/delete for Admins (or everyone for now during dev)
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.loan_plans;
CREATE POLICY "Allow full access for authenticated users" 
ON public.loan_plans 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
