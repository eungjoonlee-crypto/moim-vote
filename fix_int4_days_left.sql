-- int4 타입에 맞는 hero_days_left 수정
-- PostgreSQL의 int4 타입에 정확히 맞게 정수 계산

-- 1. 현재 컬럼 타입 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
AND column_name = 'hero_days_left';

-- 2. 현재 데이터 확인
SELECT 
  id,
  hero_days_left,
  updated_at,
  CURRENT_DATE as today,
  '2025-10-21'::date as target_date
FROM site_settings;

-- 3. 정확한 정수 계산 (int4 타입에 맞게)
-- PostgreSQL에서 날짜 차이를 정수로 변환 (수정된 방법)
UPDATE site_settings 
SET 
  hero_days_left = GREATEST(0, ('2025-10-21'::date - CURRENT_DATE)::integer),
  updated_at = NOW()
WHERE id IN (SELECT id FROM site_settings LIMIT 1);

-- 4. 대안 방법: 더 안전한 정수 계산 (EPOCH 사용)
-- UPDATE site_settings 
-- SET 
--   hero_days_left = CASE 
--     WHEN '2025-10-21'::date <= CURRENT_DATE THEN 0
--     ELSE FLOOR(EXTRACT(EPOCH FROM ('2025-10-21'::date - CURRENT_DATE)) / 86400)::integer
--   END,
--   updated_at = NOW()
-- WHERE id IN (SELECT id FROM site_settings LIMIT 1);

-- 5. 결과 확인
SELECT 
  id,
  hero_days_left,
  updated_at,
  CURRENT_DATE as today,
  '2025-10-21'::date as target_date,
  '2025-10-21'::date - CURRENT_DATE as date_diff,
  ('2025-10-21'::date - CURRENT_DATE)::integer as date_diff_int
FROM site_settings;

-- 6. 타입 확인
SELECT 
  hero_days_left,
  pg_typeof(hero_days_left) as data_type,
  hero_days_left::text as as_text
FROM site_settings;
