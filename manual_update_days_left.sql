-- hero_days_left 수동 업데이트
-- 이 SQL을 실행하여 원하는 남은 일수를 직접 설정할 수 있습니다.

-- 1. 현재 site_settings 상태 확인
SELECT 
  id,
  hero_days_left,
  hero_title,
  updated_at
FROM site_settings;

-- 2. hero_days_left 수동 업데이트 (원하는 숫자로 변경)
-- 예시: 3일 남음으로 설정
UPDATE site_settings 
SET 
  hero_days_left = 3,  -- 원하는 숫자로 변경
  updated_at = NOW()
WHERE id IN (SELECT id FROM site_settings LIMIT 1);

-- 3. 업데이트 결과 확인
SELECT 
  id,
  hero_days_left,
  updated_at
FROM site_settings;

-- 4. 다른 값으로 업데이트하고 싶을 때 사용할 수 있는 예시들:
-- 
-- 0일 남음 (투표 마감)
-- UPDATE site_settings SET hero_days_left = 0, updated_at = NOW() WHERE id IN (SELECT id FROM site_settings LIMIT 1);
--
-- 1일 남음
-- UPDATE site_settings SET hero_days_left = 1, updated_at = NOW() WHERE id IN (SELECT id FROM site_settings LIMIT 1);
--
-- 7일 남음
-- UPDATE site_settings SET hero_days_left = 7, updated_at = NOW() WHERE id IN (SELECT id FROM site_settings LIMIT 1);
