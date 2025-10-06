-- 🎵 Voice of Tomorrow Database Schema
-- 음성 경연 투표 플랫폼을 위한 데이터베이스 스키마

-- 참가자 테이블
CREATE TABLE IF NOT EXISTS contestants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  song TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 투표 테이블
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contestant_id UUID REFERENCES contestants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contestant_id)
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contestant_id UUID REFERENCES contestants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 프로필 테이블 (추가 정보)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_contestant_id ON votes(contestant_id);
CREATE INDEX IF NOT EXISTS idx_comments_contestant_id ON comments(contestant_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 참가자 테이블 - 모든 사용자가 읽기 가능
CREATE POLICY "Contestants are viewable by everyone" ON contestants
  FOR SELECT USING (true);

-- 투표 정책 - 인증된 사용자만 투표 가능
CREATE POLICY "Users can vote on contestants" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all votes" ON votes
  FOR SELECT USING (true);

-- 댓글 정책 - 인증된 사용자만 댓글 작성 가능
CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- 사용자 프로필 정책
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 함수: 투표 수 업데이트
CREATE OR REPLACE FUNCTION update_contestant_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE contestants 
    SET likes = likes + 1 
    WHERE id = NEW.contestant_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE contestants 
    SET likes = likes - 1 
    WHERE id = OLD.contestant_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 투표 시 좋아요 수 자동 업데이트
CREATE TRIGGER trigger_update_contestant_likes
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_contestant_likes();

-- 초기 참가자 데이터 삽입 (15명) - 실제 존재하고 embed 허용된 YouTube 영상 URL 사용
INSERT INTO contestants (name, song, youtube_url, youtube_id, views, likes) VALUES
  ('김민준', 'Can''t Help Falling in Love - Elvis Presley', 'https://www.youtube.com/watch?v=vGJTaP6anOU', 'vGJTaP6anOU', 15420, 892),
  ('이서연', 'Someone Like You - Adele', 'https://www.youtube.com/watch?v=hLQl3WQQoQ0', 'hLQl3WQQoQ0', 23150, 1456),
  ('박준호', 'I Will Always Love You - Whitney Houston', 'https://www.youtube.com/watch?v=3JWTaaS7LdU', '3JWTaaS7LdU', 18730, 1124),
  ('최유나', 'Shallow - Lady Gaga & Bradley Cooper', 'https://www.youtube.com/watch?v=bo_efYhYU2A', 'bo_efYhYU2A', 31240, 2103),
  ('정태양', 'Bohemian Rhapsody - Queen', 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', 'fJ9rUzIMcZQ', 27890, 1876),
  ('강하늘', 'All of Me - John Legend', 'https://www.youtube.com/watch?v=450p7goxZqg', '450p7goxZqg', 19560, 1289),
  ('윤지호', 'Shape of You - Ed Sheeran', 'https://www.youtube.com/watch?v=JGwWNGJdvx8', 'JGwWNGJdvx8', 28940, 1923),
  ('한소영', 'Rolling in the Deep - Adele', 'https://www.youtube.com/watch?v=rYEDA3JcQqw', 'rYEDA3JcQqw', 25670, 1687),
  ('조민수', 'Perfect - Ed Sheeran', 'https://www.youtube.com/watch?v=2Vv-BfVoq4g', '2Vv-BfVoq4g', 32450, 2156),
  ('임다은', 'Hello - Adele', 'https://www.youtube.com/watch?v=YQHsXMglC9A', 'YQHsXMglC9A', 29830, 1987),
  ('송재현', 'Thinking Out Loud - Ed Sheeran', 'https://www.youtube.com/watch?v=lp-EO5I60KA', 'lp-EO5I60KA', 26780, 1754),
  ('김예린', 'When We Were Young - Adele', 'https://www.youtube.com/watch?v=DDWKuo3gXMQ', 'DDWKuo3gXMQ', 31290, 2089),
  ('이동현', 'Photograph - Ed Sheeran', 'https://www.youtube.com/watch?v=nSDgHBxUbVQ', 'nSDgHBxUbVQ', 28450, 1892),
  ('박지민', 'Set Fire to the Rain - Adele', 'https://www.youtube.com/watch?v=RAz8FmiZYL8', 'RAz8FmiZYL8', 30120, 2013),
  ('최현우', 'Castle on the Hill - Ed Sheeran', 'https://www.youtube.com/watch?v=K0ibBPhiaG0', 'K0ibBPhiaG0', 27560, 1834);
