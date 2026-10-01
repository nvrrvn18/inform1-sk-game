-- Sistem Komputer Kelas VII
-- Supabase Anonymous Auth + RLS

create extension if not exists "pgcrypto";

create table public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  nama text not null,
  kelas text not null,
  kode_siswa text unique,
  created_at timestamptz default now()
);

create table public.missions (
  id text primary key,
  judul text not null,
  deskripsi text,
  urutan integer not null,
  created_at timestamptz default now()
);

insert into public.missions (id, judul, deskripsi, urutan) values
('misi1','Perangkat Keras, Perangkat Lunak, dan Brainware','Mengenal tiga unsur utama sistem komputer',1),
('misi2','Input, Process, Output, dan Storage','Mengenal fungsi perangkat komputer',2),
('misi3','Cara Kerja Sistem Komputer','Memahami perjalanan data',3),
('misi4','Sistem Operasi','Mengenal fungsi sistem operasi',4),
('final','Final Mission','Uji pemahaman seluruh materi',5);

create table public.mission_progress (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  mission_id text references public.missions(id) on delete cascade,
  score integer default 0,
  best_score integer default 0,
  completed boolean default false,
  attempts integer default 0,
  completed_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, mission_id)
);

create table public.activity_results (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  mission_id text references public.missions(id) on delete cascade,
  activity_id text not null,
  score integer default 0,
  benar integer default 0,
  total_soal integer default 0,
  created_at timestamptz default now()
);

create table public.final_results (
  id bigint generated always as identity primary key,
  user_id uuid unique references auth.users(id) on delete cascade,
  final_score integer default 0,
  benar integer default 0,
  jumlah_soal integer default 0,
  selesai_at timestamptz default now()
);

alter table public.students enable row level security;
alter table public.missions enable row level security;
alter table public.mission_progress enable row level security;
alter table public.activity_results enable row level security;
alter table public.final_results enable row level security;

create policy "student insert own profile" on public.students
for insert to authenticated with check (auth.uid() = user_id);

create policy "student read own profile" on public.students
for select to authenticated using (auth.uid() = user_id);

create policy "everyone read missions" on public.missions
for select to authenticated using (true);

create policy "student read own progress" on public.mission_progress
for select to authenticated using (auth.uid() = user_id);

create policy "student insert own progress" on public.mission_progress
for insert to authenticated with check (auth.uid() = user_id);

create policy "student update own progress" on public.mission_progress
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "student read own activity" on public.activity_results
for select to authenticated using (auth.uid() = user_id);

create policy "student insert own activity" on public.activity_results
for insert to authenticated with check (auth.uid() = user_id);

create policy "student read own final" on public.final_results
for select to authenticated using (auth.uid() = user_id);

create policy "student insert own final" on public.final_results
for insert to authenticated with check (auth.uid() = user_id);

create view public.student_scores as
select s.nama, s.kelas, m.id as mission_id, m.judul as misi,
       p.score, p.best_score, p.completed, p.attempts, p.updated_at
from public.students s
join public.mission_progress p on s.user_id = p.user_id
join public.missions m on p.mission_id = m.id;
