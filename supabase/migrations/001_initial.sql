-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase

-- ============================================================
-- PERFILES DE USUARIO
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,

  -- Contacto
  nombre          text,
  apellidos       text,
  email           text,
  telefono        text,

  -- Demográficos
  fecha_nacimiento date,
  genero          text,   -- 'hombre', 'mujer', 'otro', 'prefiero_no_decir'
  peso_kg         numeric(5,2),
  altura_cm       int,
  ciudad          text,
  pais            text default 'España',

  -- Entrenamiento (del onboarding)
  objetivo        text,   -- 'rugby', 'navette', 'carrera_popular', 'forma_fisica'
  nivel           text,   -- 'sedentario', 'algo_activo', 'activo'
  dias_semana     int,

  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

-- ============================================================
-- PLANES DE ENTRENAMIENTO
-- ============================================================
create table if not exists planes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  titulo text not null,
  plan_data jsonb not null,   -- plan completo en JSON
  activo boolean default true not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- SESIONES COMPLETADAS
-- ============================================================
create table if not exists sesiones_completadas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  plan_id uuid references planes on delete cascade not null,
  semana_numero int not null,
  sesion_dia text not null,
  sesion_tipo text not null,
  completada_at timestamptz default now() not null,
  unique (plan_id, semana_numero, sesion_dia)
);

-- ============================================================
-- ROW LEVEL SECURITY — cada usuario solo ve sus datos
-- ============================================================
alter table profiles enable row level security;
alter table planes enable row level security;
alter table sesiones_completadas enable row level security;

create policy "profiles_own" on profiles
  for all using (auth.uid() = id);

create policy "planes_own" on planes
  for all using (auth.uid() = user_id);

create policy "sesiones_own" on sesiones_completadas
  for all using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: crea perfil automáticamente al registrarse
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
