alter table borrowers 
add column collector_id uuid references auth.users(id);
