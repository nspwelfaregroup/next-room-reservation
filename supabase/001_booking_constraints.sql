-- รันครั้งเดียวใน Supabase Dashboard → SQL Editor
-- ถ้าข้อมูลเดิมมีการจองที่ทับกันอยู่แล้ว constraint ข้อ 2 จะสร้างไม่ผ่าน ต้องแก้ข้อมูลก่อน

-- 1) ค่า default ให้ครบ
alter table public.bookings
  alter column status set default 'ACTIVE',
  alter column "createdAt" set default now(),
  alter column "updatedAt" set default now();

-- 2) กันจองเวลาทับกันในระดับฐานข้อมูล (กันกรณีสองคนกดจองพร้อมกันเป๊ะ)
--    ใช้ช่วงแบบ [start, end) → 09:00-10:00 กับ 10:00-11:00 ไม่นับว่าทับ
create extension if not exists btree_gist;

alter table public.bookings
  add constraint bookings_time_valid check ("endAt" > "startAt"),
  add constraint bookings_status_valid check (status in ('ACTIVE', 'CANCELLED')),
  add constraint bookings_no_overlap exclude using gist (
    "roomId" with =,
    tstzrange("startAt", "endAt", '[)') with &&
  ) where (status = 'ACTIVE');

-- 3) index สำหรับหน้า "การจองของฉัน"
create index if not exists bookings_user_start_idx on public.bookings ("userId", "startAt");

-- 4) เปิด RLS ทุกตาราง และไม่สร้าง policy ให้ anon/authenticated
--    → publishable key อ่าน/เขียนอะไรไม่ได้เลย ใช้ได้แค่ secret key ฝั่ง server
--    (สำคัญมาก: ตาราง config เก็บ LINE_CHANNEL_ACCESS_TOKEN)
alter table public.users enable row level security;
alter table public.departments enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.config enable row level security;

-- ถ้าเคยสร้าง policy ที่เปิดให้ anon ไว้ ให้ลบทิ้ง ตรวจดูได้ด้วย:
-- select tablename, policyname, roles, cmd from pg_policies where schemaname = 'public';

-- 5) (ไม่บังคับ) กติกาการจอง — ถ้าไม่ใส่ ระบบใช้ค่า default 07:00-20:00 และล่วงหน้า 60 วัน
-- insert into public.config (key, value) values
--   ('BOOKING_OPEN_TIME', '07:00'),
--   ('BOOKING_CLOSE_TIME', '20:00'),
--   ('BOOKING_MAX_DAYS_AHEAD', '60')
-- on conflict (key) do update set value = excluded.value;
