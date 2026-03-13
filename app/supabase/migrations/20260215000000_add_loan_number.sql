BEGIN;

-- 1. Add loan_number column
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS loan_number text UNIQUE;

-- 2. Create function to generate loan_number
CREATE OR REPLACE FUNCTION generate_loan_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year text;
    last_seq integer;
    next_seq integer;
BEGIN
    -- Get 2-digit year (e.g., '26' for 2026)
    current_year := to_char(COALESCE(NEW.created_at, CURRENT_TIMESTAMP), 'YY');
    
    -- Find the highest sequence number for this year
    -- Look for loan_numbers that start with the current year prefix and have exactly 5 characters
    SELECT COALESCE(
        MAX(SUBSTRING(loan_number FROM 3 FOR 3)::integer), 
        -1
    ) INTO last_seq
    FROM public.loans
    WHERE loan_number LIKE current_year || '___';
    
    next_seq := last_seq + 1;
    
    -- Format next_seq to 3 digits, e.g., 000, 001
    NEW.loan_number := current_year || LPAD(next_seq::text, 3, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger
DROP TRIGGER IF EXISTS trg_generate_loan_number ON public.loans;
CREATE TRIGGER trg_generate_loan_number
BEFORE INSERT ON public.loans
FOR EACH ROW
WHEN (NEW.loan_number IS NULL)
EXECUTE FUNCTION generate_loan_number();

-- 4. Backfill existing loans (if any)
DO $$
DECLARE
    loan_record RECORD;
    v_year text;
    v_last_seq integer;
    v_next_seq integer;
BEGIN
    FOR loan_record IN 
        SELECT id, created_at FROM public.loans 
        WHERE loan_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        v_year := to_char(loan_record.created_at, 'YY');
        
        SELECT COALESCE(
            MAX(SUBSTRING(loan_number FROM 3 FOR 3)::integer), 
            -1
        ) INTO v_last_seq
        FROM public.loans
        WHERE loan_number LIKE v_year || '___';
        
        v_next_seq := v_last_seq + 1;
        
        UPDATE public.loans 
        SET loan_number = v_year || LPAD(v_next_seq::text, 3, '0')
        WHERE id = loan_record.id;
    END LOOP;
END;
$$;

COMMIT;
