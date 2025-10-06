# 🎵 Supabase 설정 가이드

## ✅ 완료된 설정

### 1. 환경변수 설정
- `.env.local` 파일 생성 완료
- Supabase URL과 API Key 설정 완료

### 2. 데이터베이스 스키마
- `supabase/migrations/001_initial_schema.sql` 생성 완료
- 음성 경연 투표 플랫폼에 필요한 테이블들 정의

## 🚀 다음 단계: Supabase 대시보드에서 설정

### 1. 데이터베이스 스키마 실행

1. **Supabase 대시보드** 접속: https://supabase.com/dashboard
2. **프로젝트 선택**: `gmujzyyvdllvapbphtnw`
3. **SQL Editor** 이동
4. 다음 SQL 코드를 복사하여 실행:

```sql
-- 🎵 Voice of Tomorrow Database Schema
-- 음성 경연 투표 플랫폼을 위한 데이터베이스 스키마

-- 참가자 테이블
CREATE TABLE IF NOT EXISTS contestants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  song TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
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

-- 초기 참가자 데이터 삽입
INSERT INTO contestants (name, song, youtube_id, views, likes) VALUES
  ('김민준', 'Can''t Help Falling in Love - Elvis Presley', 'vGJTaP6anOU', 15420, 892),
  ('이서연', 'Someone Like You - Adele', 'hLQl3WQQoQ0', 23150, 1456),
  ('박준호', 'I Will Always Love You - Whitney Houston', '3JWTaaS7LdU', 18730, 1124),
  ('최유나', 'Shallow - Lady Gaga & Bradley Cooper', 'bo_efYhYU2A', 31240, 2103),
  ('정태양', 'Bohemian Rhapsody - Queen', 'fJ9rUzIMcZQ', 27890, 1876),
  ('강하늘', 'All of Me - John Legend', '450p7goxZqg', 19560, 1289);
```

### 2. 인증 설정 (OAuth)

1. **Authentication** → **Providers** 이동
2. **Google** 활성화:
   - Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
   - Redirect URL: `https://gmujzyyvdllvapbphtnw.supabase.co/auth/v1/callback`
   - Client ID와 Client Secret을 Supabase에 입력

3. **Kakao** 활성화 (선택사항):
   - Kakao Developers에서 애플리케이션 등록
   - Redirect URI: `https://gmujzyyvdllvapbphtnw.supabase.co/auth/v1/callback`
   - REST API Key를 Supabase에 입력

### 3. 테스트

설정 완료 후 다음을 확인하세요:

1. **개발 서버 재시작**:
   ```bash
   npm run dev
   ```

2. **브라우저에서 테스트**:
   - http://localhost:8080 접속
   - 로그인 버튼 클릭
   - Google/Kakao 로그인 테스트

## 🎯 완료 체크리스트

- [ ] 환경변수 설정 (`.env.local`)
- [ ] 데이터베이스 스키마 실행
- [ ] RLS 정책 설정
- [ ] 초기 데이터 삽입
- [ ] Google OAuth 설정
- [ ] Kakao OAuth 설정 (선택사항)
- [ ] 로그인 테스트

## 🚀 다음 단계

모든 설정이 완료되면:
1. 실제 데이터베이스에서 참가자 정보를 가져오도록 코드 수정
2. 투표 기능을 데이터베이스와 연동
3. 댓글 시스템을 데이터베이스와 연동
4. 실시간 업데이트 기능 추가

---
🎵 **Voice of Tomorrow** - 음성 경연 투표 플랫폼이 준비되었습니다!
