-- Stratos Microfinance System Schema (Supabase/PostgreSQL)

-- 1. Profiles (Extends Supabase Auth)
-- Links to auth.users. Stores roles (admin/collector).
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text not null,
  role text not null check (role in ('admin', 'collector')),
  phone text,
  created_at timestamptz default now()
);

-- 2. Borrowers
-- Assigned to a specific collector (optional, can be null if pool-based, but SRS implies assignment).
create table public.borrowers (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  nic_number text unique not null,
  phone text not null,
  address text not null,
  guarantor_name text,
  guarantor_phone text,
  guarantor_nic text,
  assigned_collector_id uuid references public.profiles(id),
  status text default 'active' check (status in ('active', 'inactive', 'blacklisted')),
  created_at timestamptz default now()
);

-- 3. Loan Plans (Static definitions 20k/25k)
create table public.loan_plans (
  id serial primary key,
  name text not null, -- "Type 1", "Type 2"
  principal_amount numeric not null, -- 20000, 25000
  installment_amount numeric not null, -- 1800, 1650
  duration_months integer not null, -- 12, 17
  total_payable numeric generated always as (installment_amount * duration_months) stored
);

-- 4. Loans
-- Instance of a loan plan given to a borrower.
create table public.loans (
  id uuid default gen_random_uuid() primary key,
  borrower_id uuid references public.borrowers(id) not null,
  plan_id integer references public.loan_plans(id) not null,
  
  start_date date not null default current_date,
  end_date date not null, -- Calced from start_date + duration
  
  status text default 'active' check (status in ('active', 'completed', 'defaulted')),
  
  -- Snapshot values in case plan changes later
  principal_amount numeric not null,
  installment_amount numeric not null,
  
  created_at timestamptz default now()
);

-- 5. Payments
-- Individual installments collected.
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  loan_id uuid references public.loans(id) not null,
  collector_id uuid references public.profiles(id) not null, -- Who collected it
  
  amount numeric not null check (amount > 0),
  date_collected timestamptz default now(),
  installment_number integer not null, -- e.g. 1st month, 2nd month
  
  notes text,
  created_at timestamptz default now()
);

-- Seed Data: Loan Plans
insert into public.loan_plans (name, principal_amount, installment_amount, duration_months)
values 
  ('Silver Start (Type 1)', 20000, 1800, 12),
  ('Gold Grow (Type 2)', 25000, 1650, 17);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.borrowers enable row level security;
alter table public.loans enable row level security;
alter table public.payments enable row level security;

-- Policies (Simplified for Initial Setup)
-- Admins can do everything.
-- Collectors can view assigned borrowers and insert payments.
-- (Detailed policies to be implemented in Supabase Dashboard)
