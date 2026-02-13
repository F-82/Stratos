DO $$
DECLARE
    r RECORD;
BEGIN
    -- Find constraint name for borrowers.collector_id
    FOR r IN SELECT con.conname
             FROM pg_catalog.pg_constraint con
             INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
             INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
             WHERE nsp.nspname = 'public' AND rel.relname = 'borrowers' AND con.contype = 'f'
    LOOP
        -- We need to check if this constraint is on collector_id. 
        -- It's harder to check column textually in DO block dynamically without more complex queries.
        -- Simpler approach: Drop the specific constraint if known, or DROP matches.
        -- Since we added it via `references auth.users(id)`, it usually gets a generated name.
        -- Let's try to identify it by the foreign table.
        
        -- Actually, let's just use the column name approach standard for these migrations:
        -- checking information_schema is easier for existence but dropping requires name.
        IF EXISTS (
            SELECT 1 FROM information_schema.key_column_usage kcu
            WHERE kcu.table_name = 'borrowers' 
            AND kcu.column_name = 'collector_id'
            AND kcu.constraint_name = r.conname
        ) THEN
            EXECUTE 'ALTER TABLE borrowers DROP CONSTRAINT ' || quote_ident(r.conname);
        END IF;
    END LOOP;

    -- Re-add with ON DELETE SET NULL
    ALTER TABLE borrowers 
    ADD CONSTRAINT borrowers_collector_id_fkey 
    FOREIGN KEY (collector_id) 
    REFERENCES auth.users(id) 
    ON DELETE SET NULL;
END $$;
