# Supabase 데이터베이스 스키마 업데이트

## 문제 상황
현재 데이터베이스에서 `youtube_url` 컬럼을 찾을 수 없다는 오류가 발생하고 있습니다.

## 해결 방법

### 1. Supabase 대시보드에서 SQL Editor 열기
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2. 다음 SQL 코드를 실행

```sql
-- 1. youtube_url 컬럼이 존재하는지 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contestants' 
AND column_name IN ('youtube_url', 'youtube_id');

-- 2. youtube_url 컬럼이 없다면 추가
ALTER TABLE contestants 
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- 3. youtube_id 컬럼이 없다면 추가
ALTER TABLE contestants 
ADD COLUMN IF NOT EXISTS youtube_id TEXT;

-- 4. 기존 데이터에 youtube_url 값이 없다면 기본값 설정
UPDATE contestants 
SET youtube_url = 'https://www.youtube.com/watch?v=' || youtube_id
WHERE youtube_url IS NULL OR youtube_url = '';

-- 5. youtube_id가 없다면 youtube_url에서 추출
UPDATE contestants 
SET youtube_id = CASE 
  WHEN youtube_url ~ 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})' THEN 
    (regexp_match(youtube_url, 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})'))[1]
  WHEN youtube_url ~ 'youtu\.be/([a-zA-Z0-9_-]{11})' THEN 
    (regexp_match(youtube_url, 'youtu\.be/([a-zA-Z0-9_-]{11})'))[1]
  ELSE NULL
END
WHERE youtube_id IS NULL OR youtube_id = '';

-- 6. 결과 확인
SELECT id, name, song, youtube_url, youtube_id, views, likes 
FROM contestants 
LIMIT 5;
```

### 3. 만약 테이블이 아직 생성되지 않았다면

```sql
-- 참가자 테이블 생성
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

-- 투표 테이블 생성
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contestant_id UUID REFERENCES contestants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contestant_id)
);

-- 댓글 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contestant_id UUID REFERENCES contestants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 초기 데이터 삽입
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
```

## 확인 방법

SQL 실행 후 다음을 확인하세요:

1. **테이블 구조 확인**:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contestants' 
ORDER BY ordinal_position;
```

2. **데이터 확인**:
```sql
SELECT id, name, song, youtube_url, youtube_id, views, likes 
FROM contestants 
LIMIT 5;
```

3. **애플리케이션에서 확인**:
   - http://localhost:8081 접속
   - 참가자 목록이 정상적으로 표시되는지 확인
   - Admin 페이지에서 YouTube URL이 표시되는지 확인

## 문제 해결 후

스키마 업데이트가 완료되면 애플리케이션이 정상적으로 작동할 것입니다.
