-- 406 오류 해결: votes 테이블 RLS 정책 수정

-- 1. 현재 votes 테이블 상태 확인
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  hasrls
FROM pg_tables 
WHERE tablename = 'votes';

-- 2. 현재 RLS 정책 확인
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'votes';

-- 3. 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Allow all operations on votes" ON public.votes;
DROP POLICY IF EXISTS "votes_read" ON public.votes;
DROP POLICY IF EXISTS "votes_insert" ON public.votes;
DROP POLICY IF EXISTS "votes_update" ON public.votes;
DROP POLICY IF EXISTS "votes_delete" ON public.votes;

-- 4. RLS 활성화 확인
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 5. 새로운 정책 생성 (모든 사용자 허용)
CREATE POLICY "votes_allow_all" ON public.votes
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 6. 정책이 제대로 생성되었는지 확인
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'votes';

-- 7. 테스트용 투표 데이터 조회 (정책이 제대로 작동하는지 확인)
SELECT COUNT(*) as total_votes FROM public.votes;

-- 8. 특정 사용자의 투표 조회 테스트
SELECT 
  user_id, 
  contestant_id, 
  created_at 
FROM public.votes 
LIMIT 5;
