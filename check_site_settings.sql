-- site_settings 테이블 현재 상태 확인

-- 1. 현재 site_settings 데이터 조회
SELECT 
  id,
  hero_title,
  hero_subtitle,
  hero_image_url,
  hero_contestant_count,
  hero_days_left,
  meta_title,
  meta_description,
  updated_at
FROM site_settings;

-- 2. 현재 날짜와 목표 날짜 계산
SELECT 
  CURRENT_DATE as today,
  '2025-10-21'::date as target_date,
  '2025-10-21'::date - CURRENT_DATE as days_difference,
  CASE 
    WHEN '2025-10-21'::date - CURRENT_DATE < 0 THEN 0
    ELSE '2025-10-21'::date - CURRENT_DATE
  END as calculated_days_left;

-- 3. site_settings 업데이트 (2025년 10월 21일 기준)
-- int4 타입에 맞게 정수로 계산
UPDATE site_settings 
SET 
  hero_days_left = CASE 
    WHEN '2025-10-21'::date - CURRENT_DATE < 0 THEN 0
    ELSE ('2025-10-21'::date - CURRENT_DATE)::integer
  END,
  updated_at = NOW()
WHERE id IN (SELECT id FROM site_settings LIMIT 1);

-- 4. 업데이트 후 결과 확인
SELECT 
  id,
  hero_days_left,
  updated_at,
  '2025-10-21'::date - CURRENT_DATE as manual_calculation
FROM site_settings;
