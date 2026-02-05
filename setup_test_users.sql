-- 1. Ensure the 'Collector' user has the correct role
-- (By default, your system assigns 'admin' to everyone, so we must fix this)
UPDATE public.profiles
SET role = 'collector'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 's66@gmail.com'
);

-- 2. Ensure the 'Admin' user has the Admin role (Just to be safe)
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'a55@gmail.com'
);

-- 3. Verify the roles
SELECT auth.users.email, public.profiles.role 
FROM auth.users 
JOIN public.profiles ON auth.users.id = public.profiles.id
WHERE email IN ('a55@gmail.com', 's66@gmail.com');
