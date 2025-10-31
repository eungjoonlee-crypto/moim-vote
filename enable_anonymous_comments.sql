-- 익명 댓글 작성 활성화
-- 로그인 없이 누구나 댓글을 작성할 수 있도록 설정

-- 1. comments 테이블에 익명 작성자 ID 컬럼 추가
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS anonymous_voter_id TEXT;

-- 2. user_id를 nullable로 변경 (익명 댓글 지원)
ALTER TABLE public.comments 
ALTER COLUMN user_id DROP NOT NULL;

-- 3. RLS 정책 업데이트 - 모든 사람이 댓글 작성 가능하도록 변경
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Anyone can create comments" ON public.comments
  FOR INSERT WITH CHECK (true);

-- 4. 댓글 조회는 모든 사람 가능
DROP POLICY IF EXISTS "Users can view comments" ON public.comments;
CREATE POLICY "Everyone can view comments" ON public.comments
  FOR SELECT USING (true);

-- 5. 댓글 삭제는 자신이 작성한 것만 가능
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (
    (auth.uid() = user_id) OR 
    (anonymous_voter_id IS NOT NULL)
  );

-- 6. 댓글 수정은 자신이 작성한 것만 가능 (선택적)
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (
    (auth.uid() = user_id) OR 
    (anonymous_voter_id IS NOT NULL)
  );

-- 7. 확인 쿼리
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'comments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. RLS 정책 확인
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
WHERE tablename = 'comments'
ORDER BY policyname;

