-- 참가자 섹션 콘텐츠 표시 옵션 추가
-- site_settings 테이블에 참가자 카드의 각 요소를 선택적으로 표시/숨길 수 있는 옵션 추가

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS show_comments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_vote_button BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_vote_count BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_share_button BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_views BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_likes BOOLEAN DEFAULT false;

-- 기존 레코드가 있으면 기본값 설정
UPDATE public.site_settings 
SET 
  show_comments = COALESCE(show_comments, true),
  show_vote_button = COALESCE(show_vote_button, true),
  show_vote_count = COALESCE(show_vote_count, true),
  show_share_button = COALESCE(show_share_button, true),
  show_views = COALESCE(show_views, false),
  show_likes = COALESCE(show_likes, false)
WHERE show_comments IS NULL OR show_vote_button IS NULL OR show_vote_count IS NULL OR show_share_button IS NULL OR show_views IS NULL OR show_likes IS NULL;

-- 설정 확인 쿼리
SELECT 
  id,
  show_comments,
  show_vote_button,
  show_vote_count,
  show_share_button,
  show_views,
  show_likes
FROM public.site_settings;

