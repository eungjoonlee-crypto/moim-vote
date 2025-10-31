-- 참가자별 노출 여부 설정 추가
-- contestants 테이블에 각 참가자마다 표시/숨김을 제어할 수 있는 필드 추가

ALTER TABLE public.contestants 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 기존 참가자들은 모두 표시되도록 설정
UPDATE public.contestants 
SET is_visible = true 
WHERE is_visible IS NULL;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_contestants_is_visible ON public.contestants(is_visible);

-- 설정 확인 쿼리
SELECT 
  id,
  name,
  song,
  is_visible,
  created_at
FROM public.contestants 
ORDER BY created_at;

-- 특정 참가자 숨기기 예시
-- UPDATE public.contestants SET is_visible = false WHERE id = '참가자_id';

-- 특정 참가자 다시 보이게 하기 예시
-- UPDATE public.contestants SET is_visible = true WHERE id = '참가자_id';

