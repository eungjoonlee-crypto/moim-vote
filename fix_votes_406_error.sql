-- Supabase votes 테이블 406 오류 수정
-- RLS 정책을 완전히 재설정하여 모든 사용자가 투표할 수 있도록 설정

-- 1. 기존 RLS 정책 모두 삭제
DROP POLICY IF EXISTS "votes_allow_all" ON public.votes;
DROP POLICY IF EXISTS "votes_read" ON public.votes;
DROP POLICY IF EXISTS "votes_insert" ON public.votes;
DROP POLICY IF EXISTS "votes_update" ON public.votes;
DROP POLICY IF EXISTS "votes_delete" ON public.votes;
DROP POLICY IF EXISTS "Allow all operations on votes" ON public.votes;

-- 2. RLS 활성화 확인 및 설정
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 3. 새로운 허용 정책 생성 (모든 사용자, 모든 작업 허용)
CREATE POLICY "votes_allow_all_operations" ON public.votes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. 추가 안전 정책들 (필요시)
-- 읽기 정책
CREATE POLICY "votes_select_all" ON public.votes
  FOR SELECT
  USING (true);

-- 삽입 정책  
CREATE POLICY "votes_insert_all" ON public.votes
  FOR INSERT
  WITH CHECK (true);

-- 업데이트 정책
CREATE POLICY "votes_update_all" ON public.votes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 삭제 정책
CREATE POLICY "votes_delete_all" ON public.votes
  FOR DELETE
  USING (true);

-- 5. 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'votes'
ORDER BY policyname;

-- 6. 테이블 권한 확인
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'votes' 
AND table_schema = 'public';
