-- 투표 및 댓글 데이터 초기화
-- ⚠️ 주의: 이 작업은 되돌릴 수 없습니다. 실행 전 신중히 확인하세요.

-- 1. 모든 투표 데이터 삭제
DELETE FROM public.votes;

-- 2. 모든 댓글 데이터 삭제
DELETE FROM public.comments;

-- 3. 참가자 테이블의 vote_count 초기화 (컬럼이 있는 경우)
-- vote_count 컬럼이 없다면 이 부분은 자동으로 무시됩니다
UPDATE public.contestants 
SET vote_count = 0
WHERE vote_count IS NOT NULL OR vote_count > 0;

-- 4. 확인 쿼리
SELECT 
  (SELECT COUNT(*) FROM public.votes) as total_votes,
  (SELECT COUNT(*) FROM public.comments) as total_comments,
  (SELECT SUM(COALESCE(vote_count, 0)) FROM public.contestants) as total_vote_count;

-- 결과가 모두 0이면 성공적으로 초기화된 것입니다.

