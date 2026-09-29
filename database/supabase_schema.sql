create table students(
id uuid primary key default gen_random_uuid(),
nama text,
kelas text,
kode_siswa text
);

create table mission_progress(
id bigint generated always as identity primary key,
student_id uuid,
mission_id text,
score integer,
completed boolean default false
);

create table final_results(
id bigint generated always as identity primary key,
student_id uuid,
score integer
);