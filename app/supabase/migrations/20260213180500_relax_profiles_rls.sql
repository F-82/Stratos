-- Relax Profiles RLS to ensure Admin access works
BEGIN;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop previous policies just to be sure
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- 1. READ: Allow ANY authenticated user to read ALL profiles
CREATE POLICY "Allow authenticated read" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. WRITE: Allow the service_role full bypass, and users to update their own
CREATE POLICY "Allow users to update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. INSERT: Generally handled by Auth Triggers, but let's allow service_role and users for themselves
CREATE POLICY "Allow users to insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Service role bypasses RLS anyway, but explicit grants never hurt
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

COMMIT;
