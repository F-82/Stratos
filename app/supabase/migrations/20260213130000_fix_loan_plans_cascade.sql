DO $$
DECLARE
    r RECORD;
BEGIN
    -- Check for 'created_by' column and update FK
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_plans' AND column_name = 'created_by') THEN
        -- Find constraint name
        FOR r IN SELECT con.conname
                 FROM pg_catalog.pg_constraint con
                 INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
                 INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
                 WHERE nsp.nspname = 'public' AND rel.relname = 'loan_plans' AND con.contype = 'f'
        LOOP
            EXECUTE 'ALTER TABLE loan_plans DROP CONSTRAINT ' || quote_ident(r.conname);
        END LOOP;

        ALTER TABLE loan_plans ALTER COLUMN created_by DROP NOT NULL;
        ALTER TABLE loan_plans ADD CONSTRAINT loan_plans_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    -- Check for 'user_id' column and update FK
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_plans' AND column_name = 'user_id') THEN
         -- Find constraint name
        FOR r IN SELECT con.conname
                 FROM pg_catalog.pg_constraint con
                 INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
                 INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
                 WHERE nsp.nspname = 'public' AND rel.relname = 'loan_plans' AND con.contype = 'f'
        LOOP
            EXECUTE 'ALTER TABLE loan_plans DROP CONSTRAINT ' || quote_ident(r.conname);
        END LOOP;

        ALTER TABLE loan_plans ALTER COLUMN user_id DROP NOT NULL;
        ALTER TABLE loan_plans ADD CONSTRAINT loan_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;
