-- 간단하고 안전한 hero_days_left 수정
-- PostgreSQL 오류 없이 정수 계산

-- 1. 현재 상태 확인
SELECT 
  id,
  hero_days_left,
  updated_at,
  CURRENT_DATE as today,
  '2025-10-21'::date as target_date
FROM site_settings;

-- 2. 간단한 날짜 차이 계산 (오류 없음)
SELECT 
  CURRENT_DATE as today,
  '2025-10-21'::date as target_date,
  '2025-10-21'::date - CURRENT_DATE as days_difference,
  ('2025-10-21'::date - CURRENT_DATE)::integer as days_as_integer;

-- 3. 안전한 업데이트 (음수 방지)
UPDATE site_settings 
SET 
  hero_days_left = CASE 
    WHEN '2025-10-21'::date - CURRENT_DATE < 0 THEN 0
    ELSE ('2025-10-21'::date - CURRENT_DATE)::integer
  END,
  updated_at = NOW()
WHERE id IN (SELECT id FROM site_settings LIMIT 1);

-- 4. 결과 확인
SELECT 
  id,
  hero_days_left,
  updated_at,
  CURRENT_DATE as today,
  '2025-10-21'::date as target_date,
  '2025-10-21'::date - CURRENT_DATE as manual_calculation
FROM site_settings;

-- 5. 타입 확인
SELECT 
  hero_days_left,
  pg_typeof(hero_days_left) as data_type
FROM site_settings;
