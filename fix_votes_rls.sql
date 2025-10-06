-- votes 테이블의 RLS 정책 수정
-- 투표 기능이 정상 작동하도록 RLS 정책 설정

-- 1. 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Allow all operations on votes" ON votes;

-- 2. 새로운 RLS 정책 생성 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Allow all operations on votes" ON votes
    FOR ALL USING (true) WITH CHECK (true);

-- 3. votes 테이블의 RLS 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'votes';

-- 4. 현재 votes 테이블의 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'votes';
