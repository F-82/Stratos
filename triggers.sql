-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Create a function that runs when a new user signs up (or is created in dashboard)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'System Admin'), -- Default name
    'admin' -- Default role (Change to 'collector' later if needed)
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
