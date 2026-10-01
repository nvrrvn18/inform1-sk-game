-- =====================================================
-- DASHBOARD GURU DENGAN KODE GURU
-- Jalankan sekali di Supabase SQL Editor.
-- =====================================================

create table if not exists public.teacher_access (
  id bigint generated always as identity primary key,
  kode text unique not null,
  nama text not null,
  aktif boolean not null default true,
  created_at timestamptz default now()
);

-- Contoh kode guru. Ganti dengan kode Anda sendiri.
insert into public.teacher_access (kode, nama)
values ('GURU-SK7-2026', 'Guru Sistem Komputer')
on conflict (kode) do nothing;

alter table public.teacher_access enable row level security;

-- Tidak memberikan SELECT langsung kepada anonymous.
-- Data dashboard dikembalikan melalui fungsi yang memvalidasi kode.

create or replace function public.get_teacher_dashboard(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
  result jsonb;
begin
  select exists(
    select 1
    from public.teacher_access
    where kode = p_code
      and aktif = true
  ) into ok;

  if not ok then
    return jsonb_build_object('valid', false);
  end if;

  select jsonb_build_object(
    'valid', true,
    'students', coalesce((
      select jsonb_agg(to_jsonb(s) order by s.nama)
      from public.students s
    ), '[]'::jsonb),
    'progress', coalesce((
      select jsonb_agg(to_jsonb(p))
      from public.mission_progress p
    ), '[]'::jsonb),
    'final_results', coalesce((
      select jsonb_agg(to_jsonb(f))
      from public.final_results f
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_teacher_dashboard(text) from public;
grant execute on function public.get_teacher_dashboard(text) to anon, authenticated;

-- Pastikan tabel yang dibaca fungsi tidak terbuka langsung kepada anon.
-- RLS yang sudah ada tetap berlaku untuk akses langsung.
