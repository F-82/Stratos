alter table borrowers
drop constraint if exists borrowers_collector_id_fkey,
add constraint borrowers_collector_id_fkey
    foreign key (collector_id)
    references auth.users(id)
    on delete set null;
