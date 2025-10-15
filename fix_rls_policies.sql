-- 🔒 RLS (Row Level Security) 정책 수정
-- 투표 수 조회 및 투표 기능이 제대로 작동하도록 설정

-- 1. 기존 votes 테이블 정책 모두 제거
DROP POLICY IF EXISTS "Anyone can view votes" ON votes;
DROP POLICY IF EXISTS "Users can insert their own votes" ON votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;
DROP POLICY IF EXISTS "Enable read access for all users" ON votes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON votes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON votes;

-- 2. votes 테이블 RLS 활성화 (이미 활성화되어 있으면 무시)
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 3. 새로운 정책 생성

-- 3-1. 모든 사용자가 투표 수를 조회할 수 있도록 (인증 여부 무관)
CREATE POLICY "Anyone can view votes count"
ON votes FOR SELECT
TO public
USING (true);

-- 3-2. 인증된 사용자만 투표할 수 있도록
CREATE POLICY "Authenticated users can insert votes"
ON votes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3-3. 사용자가 자신의 투표만 삭제할 수 있도록
CREATE POLICY "Users can delete their own votes"
ON votes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. contestants 테이블 정책 확인 및 수정
DROP POLICY IF EXISTS "Anyone can view contestants" ON contestants;
DROP POLICY IF EXISTS "Enable read access for all users" ON contestants;

-- 4-1. 모든 사용자가 참가자 정보를 조회할 수 있도록
CREATE POLICY "Anyone can view contestants"
ON contestants FOR SELECT
TO public
USING (true);

-- 5. comments 테이블 정책 수정
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- 5-1. 모든 사용자가 댓글을 조회할 수 있도록
CREATE POLICY "Anyone can view comments"
ON comments FOR SELECT
TO public
USING (true);

-- 5-2. 인증된 사용자만 댓글을 작성할 수 있도록
CREATE POLICY "Authenticated users can insert comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5-3. 사용자가 자신의 댓글만 삭제할 수 있도록
CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. 정책 확인
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. 투표 데이터 확인
SELECT 
    c.id,
    c.name,
    c.song,
    COUNT(v.id)::INTEGER as vote_count_from_votes,
    c.vote_count as vote_count_in_table
FROM contestants c
LEFT JOIN votes v ON v.contestant_id = c.id
GROUP BY c.id, c.name, c.song, c.vote_count
ORDER BY c.created_at;

