-- 완전히 새로운 스키마로 재구성
-- 기존 테이블 삭제 후 새로 생성

-- 1. 기존 contestants 테이블 삭제 (CASCADE로 관련 데이터도 삭제)
DROP TABLE IF EXISTS contestants CASCADE;

-- 2. 새로운 contestants 테이블 생성
CREATE TABLE contestants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    song TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS (Row Level Security) 정책 설정
ALTER TABLE contestants ENABLE ROW LEVEL SECURITY;

-- 4. 모든 사용자가 읽기/쓰기 가능하도록 정책 설정
CREATE POLICY "Allow all operations on contestants" ON contestants
    FOR ALL USING (true) WITH CHECK (true);

-- 5. 새로운 참가자 데이터 삽입
INSERT INTO contestants (name, song, youtube_url, youtube_id, views, likes) VALUES
('루이소', '옆', 'https://www.youtube.com/watch?v=_1LL3PsbTz0', '_1LL3PsbTz0', 0, 0),
('루이드', '뒤', 'https://www.youtube.com/watch?v=IE0d6xLSEvI', 'IE0d6xLSEvI', 0, 0),
('로이드', '앞', 'https://www.youtube.com/watch?v=T4c7a4Y8l4g', 'T4c7a4Y8l4g', 0, 0),
('르이드', '점', 'https://www.youtube.com/watch?v=4EEobdRKKZY', '4EEobdRKKZY', 0, 0),
('롸이드', '굿', 'https://www.youtube.com/watch?v=u0PbXTOPu6E', 'u0PbXTOPu6E', 0, 0),
('르이드', '낫', 'https://www.youtube.com/watch?v=hRjUvbuho4Y', 'hRjUvbuho4Y', 0, 0),
('롸이사', '녘', 'https://www.youtube.com/watch?v=5c6BmyxXob4', '5c6BmyxXob4', 0, 0);

-- 6. 데이터 확인
SELECT 
    id,
    name, 
    song, 
    youtube_url, 
    youtube_id, 
    views, 
    likes,
    created_at
FROM contestants 
ORDER BY created_at;
