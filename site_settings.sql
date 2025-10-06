-- site_settings: 홈페이지 동적 설정
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  meta_title text,
  meta_description text,
  updated_at timestamp with time zone default now()
);

-- 기본값 1행 보장 (없으면 생성)
insert into public.site_settings (hero_title, hero_subtitle, hero_image_url, meta_title, meta_description)
select '싱어게이 : 퀴어가수전', '예선 투표에 참여하고 최고의 목소리를 선택하세요', null, '싱어게이 : 퀴어가수전', '싱어게이 : 퀴어가수전 - 예선 투표에 참여하세요!'
where not exists (select 1 from public.site_settings);

-- RLS (선택) 모든 읽기 허용
alter table public.site_settings enable row level security;
create policy if not exists site_settings_read on public.site_settings
for select using (true);

-- 관리자만 수정 (임시로 모두 수정 허용)
create policy if not exists site_settings_write on public.site_settings
for all using (true) with check (true);
