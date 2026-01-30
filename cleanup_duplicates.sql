-- CLEANUP SCRIPT: Deduplicate Active Loans (v2)

-- We need to delete duplicate 'active' loans for the same borrower, keeping only the most recent one.
-- However, we must FIRST delete any payments associated with those "bad" loans to avoid Foreign Key errors.


-- 1. DELETE PAYMENTS associated with duplicate loans
DELETE FROM public.payments
WHERE loan_id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            borrower_id,
            ROW_NUMBER() OVER (PARTITION BY borrower_id ORDER BY created_at DESC) as rnum
        FROM public.loans
        WHERE status = 'active'
    ) t
    WHERE t.rnum > 1 -- Selects all active loans except the 1st most recent one per borrower
);


-- 2. DELETE THE DUPLICATE LOANS
DELETE FROM public.loans
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            borrower_id,
            ROW_NUMBER() OVER (PARTITION BY borrower_id ORDER BY created_at DESC) as rnum
        FROM public.loans
        WHERE status = 'active'
    ) t
    WHERE t.rnum > 1
);

-- 3. Verify Cleanup
SELECT full_name, count(*) as active_loans_count
FROM public.borrowers b
JOIN public.loans l ON l.borrower_id = b.id
WHERE l.status = 'active'
GROUP BY full_name
HAVING count(*) > 1;
