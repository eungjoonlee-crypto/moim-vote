-- 참가자별 이미지 링크 컬럼 추가
-- 영상 대신 커스텀 이미지 링크를 사용할 수 있도록 image_url 컬럼을 추가합니다.

ALTER TABLE public.contestants 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 필요 시 기본값 설정 예시 (주석 해제 후 사용)
-- UPDATE public.contestants
-- SET image_url = 'https://example.com/placeholder.png'
-- WHERE image_url IS NULL;

-- 확인용 쿼리
SELECT id, name, image_url, created_at
FROM public.contestants
ORDER BY created_at;
