-- Force fix for all collector_id constraints
DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. FIX BORROWERS TABLE
    -- Drop any constraint on borrowers that references auth.users(id) for collector_id
    FOR r IN 
        SELECT con.conname
        FROM pg_catalog.pg_constraint con
        JOIN pg_catalog.pg_attribute a ON a.attnum = ANY(con.conkey)
        WHERE con.conrelid = 'public.borrowers'::regclass
        AND a.attname = 'collector_id'
        AND con.contype = 'f' -- Foreign key
    LOOP
        EXECUTE 'ALTER TABLE public.borrowers DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;

    -- Add the correct constraint
    ALTER TABLE public.borrowers
    ADD CONSTRAINT borrowers_collector_id_fkey_final
    FOREIGN KEY (collector_id)
    REFERENCES auth.users(id)
    ON DELETE SET NULL;


    -- 2. FIX PAYMENTS TABLE
    -- Drop any constraint on payments that references auth.users(id) for collector_id
    FOR r IN 
        SELECT con.conname
        FROM pg_catalog.pg_constraint con
        JOIN pg_catalog.pg_attribute a ON a.attnum = ANY(con.conkey)
        WHERE con.conrelid = 'public.payments'::regclass
        AND a.attname = 'collector_id'
        AND con.contype = 'f'
    LOOP
        EXECUTE 'ALTER TABLE public.payments DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;

    -- Add the correct constraint
    ALTER TABLE public.payments
    ADD CONSTRAINT payments_collector_id_fkey_final
    FOREIGN KEY (collector_id)
    REFERENCES auth.users(id)
    ON DELETE SET NULL;

END $$;
