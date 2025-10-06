-- 응원하기 기능을 위한 테이블 생성
-- 사용자가 참가자에게 응원을 표시하는 기능

-- 1. 응원 테이블 생성
CREATE TABLE IF NOT EXISTS cheers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contestant_id UUID NOT NULL REFERENCES contestants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contestant_id) -- 한 사용자가 한 참가자에게 중복 응원 방지
);

-- 2. RLS 정책 설정
ALTER TABLE cheers ENABLE ROW LEVEL SECURITY;

-- 3. 모든 사용자가 읽기/쓰기 가능하도록 정책 설정
CREATE POLICY "Allow all operations on cheers" ON cheers
    FOR ALL USING (true) WITH CHECK (true);

-- 4. 응원 수를 계산하는 함수 생성
CREATE OR REPLACE FUNCTION get_cheer_count(contestant_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM cheers 
        WHERE contestant_id = contestant_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 사용자의 응원 상태를 확인하는 함수 생성
CREATE OR REPLACE FUNCTION is_user_cheered(user_uuid UUID, contestant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS(
            SELECT 1 
            FROM cheers 
            WHERE user_id = user_uuid AND contestant_id = contestant_uuid
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
