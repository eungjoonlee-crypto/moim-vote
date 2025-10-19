-- 간단한 votes 테이블 406 오류 수정
-- 모든 기존 정책을 삭제하고 완전히 허용하는 정책으로 교체

-- 1. 모든 기존 정책 삭제
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'votes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.votes';
    END LOOP;
END $$;

-- 2. RLS 활성화 확인
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 3. 단일 허용 정책 생성 (모든 작업 허용)
CREATE POLICY "votes_complete_access" ON public.votes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 4. 결과 확인
SELECT 
  'votes' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'votes';
