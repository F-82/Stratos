-- Add installment_type and generic duration to loan_plans
-- installment_type: 'weekly' or 'monthly'
-- duration: number of installments (weeks or months)
-- Remove interest_rate reliance (keep column but make nullable)

ALTER TABLE public.loan_plans
    ADD COLUMN IF NOT EXISTS installment_type TEXT NOT NULL DEFAULT 'monthly' CHECK (installment_type IN ('weekly', 'monthly')),
    ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Copy existing duration_months into duration for backward compatibility
UPDATE public.loan_plans
SET duration = duration_months
WHERE duration IS NULL;

-- Make duration NOT NULL after populating
ALTER TABLE public.loan_plans
    ALTER COLUMN duration SET NOT NULL;

-- Make interest_rate optional
ALTER TABLE public.loan_plans
    ALTER COLUMN interest_rate DROP NOT NULL;
