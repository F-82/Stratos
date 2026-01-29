-- RUN THIS IN SUPABASE SQL EDITOR

-- Enable RLS on all tables (if not already done)
alter table public.profiles enable row level security;
alter table public.borrowers enable row level security;
alter table public.loans enable row level security;
alter table public.payments enable row level security;
alter table public.loan_plans enable row level security;

-- PROFILES Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- BORROWERS Policies
create policy "Authenticated users can view borrowers"
  on public.borrowers for select
  to authenticated
  using ( true );

create policy "Authenticated users can create borrowers"
  on public.borrowers for insert
  to authenticated
  with check ( true );

create policy "Authenticated users can update borrowers"
  on public.borrowers for update
  to authenticated
  using ( true );

-- LOANS Policies
create policy "Authenticated users can view loans"
  on public.loans for select
  to authenticated
  using ( true );

create policy "Authenticated users can create loans"
  on public.loans for insert
  to authenticated
  with check ( true );

create policy "Authenticated users can update loans"
  on public.loans for update
  to authenticated
  using ( true );

-- PAYMENTS Policies
create policy "Authenticated users can view payments"
  on public.payments for select
  to authenticated
  using ( true );

create policy "Authenticated users can create payments"
  on public.payments for insert
  to authenticated
  with check ( true );

-- LOAN PLANS Policies
create policy "Loan plans are viewable by everyone"
  on public.loan_plans for select
  using ( true );
