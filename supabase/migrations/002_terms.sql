-- Añade columna para registrar cuándo el usuario aceptó los términos
alter table profiles
  add column if not exists terminos_aceptados_at timestamptz;
