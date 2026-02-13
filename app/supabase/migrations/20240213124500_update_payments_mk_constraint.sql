alter table payments
drop constraint if exists payments_collector_id_fkey,
add constraint payments_collector_id_fkey
    foreign key (collector_id)
    references auth.users(id)
    on delete set null;
