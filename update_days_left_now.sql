-- site_settings의 hero_days_left를 2025년 10월 21일 기준으로 즉시 업데이트

-- 현재 날짜와 목표 날짜(2025-10-21) 사이의 일수 계산
WITH days_calculation AS (
  SELECT 
    CASE 
      WHEN '2025-10-21'::date - CURRENT_DATE < 0 THEN 0
      ELSE '2025-10-21'::date - CURRENT_DATE
    END as calculated_days
)
UPDATE public.site_settings 
SET 
  hero_days_left = (SELECT calculated_days FROM days_calculation),
  updated_at = NOW()
WHERE id IN (SELECT id FROM public.site_settings LIMIT 1);

-- 결과 확인
SELECT 
  id,
  hero_title,
  hero_days_left,
  updated_at,
  '2025-10-21'::date - CURRENT_DATE as manual_calculation
FROM public.site_settings;

-- 현재 날짜 정보도 함께 표시
SELECT 
  CURRENT_DATE as today,
  '2025-10-21'::date as target_date,
  '2025-10-21'::date - CURRENT_DATE as days_difference;
