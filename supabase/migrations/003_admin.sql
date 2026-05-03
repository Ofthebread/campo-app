-- Add role column to profiles
alter table profiles
  add column if not exists role text default 'user'
  check (role in ('user', 'admin'));

-- Set admin role for the main admin user
update profiles
set role = 'admin'
where id = (select id from auth.users where email = 'angeladelpan@gmail.com');
