-- 2025년 10월 21일까지 남은 일수 자동 계산 및 업데이트

-- Step 1: 남은 일수를 계산하는 함수 생성
CREATE OR REPLACE FUNCTION calculate_days_left()
RETURNS INTEGER AS $$
DECLARE
  target_date DATE := '2025-10-21';
  days_remaining INTEGER;
BEGIN
  -- 현재 날짜(한국 시간 기준)와 목표 날짜의 차이 계산
  days_remaining := target_date - CURRENT_DATE;
  
  -- 음수가 되지 않도록 보장 (마감일 이후에는 0)
  IF days_remaining < 0 THEN
    days_remaining := 0;
  END IF;
  
  RETURN days_remaining;
END;
$$ LANGUAGE plpgsql;

-- Step 2: site_settings의 hero_days_left를 업데이트하는 함수 생성
CREATE OR REPLACE FUNCTION update_hero_days_left()
RETURNS void AS $$
BEGIN
  UPDATE public.site_settings
  SET 
    hero_days_left = calculate_days_left(),
    updated_at = NOW()
  WHERE id IN (SELECT id FROM public.site_settings LIMIT 1);
  
  RAISE NOTICE '남은 일수가 업데이트되었습니다: %일', calculate_days_left();
END;
$$ LANGUAGE plpgsql;

-- Step 3: 현재 즉시 업데이트 실행
SELECT update_hero_days_left();

-- Step 4: pg_cron 확장 프로그램 활성화 (이미 활성화되어 있으면 무시됨)
-- 주의: Supabase 무료 플랜에서는 pg_cron이 제한될 수 있습니다.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 5: 매일 자정(한국 시간 00:00)에 자동 실행되도록 크론 작업 등록
-- 기존 작업이 있으면 삭제
SELECT cron.unschedule('update-days-left-daily') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'update-days-left-daily'
);

-- 새로운 크론 작업 등록 (매일 자정 실행)
-- Supabase는 UTC 시간을 사용하므로, 한국 시간 00:00 = UTC 15:00 (전날)
SELECT cron.schedule(
  'update-days-left-daily',           -- 작업 이름
  '0 15 * * *',                       -- 매일 UTC 15:00 (한국 시간 자정)
  $$SELECT update_hero_days_left();$$ -- 실행할 함수
);

-- 확인용: 현재 남은 일수 조회
SELECT 
  id,
  hero_title,
  hero_days_left,
  calculate_days_left() as calculated_days,
  updated_at
FROM public.site_settings;

-- 함수 설명 추가
COMMENT ON FUNCTION calculate_days_left() IS 
  '2025년 10월 22일까지 남은 일수를 계산하는 함수';

COMMENT ON FUNCTION update_hero_days_left() IS 
  'site_settings의 hero_days_left를 자동으로 업데이트하는 함수. 매일 자정에 크론으로 실행됨';

