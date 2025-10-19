-- 투표 마감 일수 계산 오류 수정
-- 현재 날짜 기준으로 정확한 남은 일수 계산 및 업데이트

-- 1. 현재 상황 확인
SELECT 
  CURRENT_DATE as today,
  CURRENT_TIMESTAMP as now_with_time,
  '2025-10-21'::date as target_date,
  '2025-10-21'::date - CURRENT_DATE as days_difference,
  EXTRACT(EPOCH FROM ('2025-10-21'::date - CURRENT_DATE)) / 86400 as days_precise;

-- 2. 현재 site_settings 상태 확인
SELECT 
  id,
  hero_days_left,
  updated_at,
  hero_title
FROM site_settings;

-- 3. 정확한 계산으로 업데이트
-- 2025년 10월 21일까지 남은 일수 (음수 방지)
-- int4 타입에 맞게 정수로 명시적 변환
WITH days_calc AS (
  SELECT 
    CASE 
      WHEN '2025-10-21'::date - CURRENT_DATE < 0 THEN 0
      ELSE ('2025-10-21'::date - CURRENT_DATE)::integer
    END as calculated_days
)
UPDATE site_settings 
SET 
  hero_days_left = (SELECT calculated_days FROM days_calc),
  updated_at = NOW()
WHERE id IN (SELECT id FROM site_settings LIMIT 1);

-- 4. 업데이트 결과 확인
SELECT 
  id,
  hero_days_left,
  updated_at,
  CURRENT_DATE as today,
  '2025-10-21'::date as target_date,
  '2025-10-21'::date - CURRENT_DATE as manual_calculation
FROM site_settings;

-- 5. 추가 확인: 시간대 고려
SELECT 
  NOW() as current_timestamp,
  CURRENT_DATE as current_date,
  '2025-10-21'::date as target_date,
  '2025-10-21'::date - CURRENT_DATE as days_left,
  CASE 
    WHEN '2025-10-21'::date - CURRENT_DATE < 0 THEN 0
    ELSE '2025-10-21'::date - CURRENT_DATE
  END as final_days_left;
