-- Migration to add extended borrower details (Guarantor 1 address, Guarantor 2, and Spouse)
ALTER TABLE public.borrowers
ADD COLUMN guarantor_address TEXT,
ADD COLUMN guarantor2_name TEXT,
ADD COLUMN guarantor2_phone TEXT,
ADD COLUMN guarantor2_nic TEXT,
ADD COLUMN guarantor2_address TEXT,
ADD COLUMN spouse_name TEXT,
ADD COLUMN spouse_phone TEXT,
ADD COLUMN spouse_nic TEXT,
ADD COLUMN spouse_address TEXT;
