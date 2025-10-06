# 🔧 Supabase 스키마 재구성 가이드

## 📋 **수행할 작업**

### 1️⃣ **Supabase 대시보드 접속**
- **URL**: https://supabase.com/dashboard
- **프로젝트**: gmujzyyvdllvapbphtnw

### 2️⃣ **SQL Editor 열기**
- 좌측 메뉴에서 **"SQL Editor"** 클릭
- **"New query"** 버튼 클릭

### 3️⃣ **다음 SQL 코드 복사 & 붙여넣기**

```sql
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
```

### 4️⃣ **SQL 실행**
- **"Run"** 버튼 클릭하여 SQL 실행
- 성공 메시지 확인

### 5️⃣ **결과 확인**
- **Table Editor**에서 `contestants` 테이블 확인
- 7명의 새로운 참가자 데이터가 정상적으로 삽입되었는지 확인

## 🎯 **예상 결과**

### ✅ **새로운 참가자 목록:**
1. **루이소** - "옆" (YouTube: _1LL3PsbTz0)
2. **루이드** - "뒤" (YouTube: IE0d6xLSEvI)  
3. **로이드** - "앞" (YouTube: T4c7a4Y8l4g)
4. **르이드** - "점" (YouTube: 4EEobdRKKZY)
5. **롸이드** - "굿" (YouTube: u0PbXTOPu6E)
6. **르이드** - "낫" (YouTube: hRjUvbuho4Y)
7. **롸이사** - "녘" (YouTube: 5c6BmyxXob4)

### 🔧 **스키마 특징:**
- **완전히 새로운 테이블** 구조
- **RLS 정책** 완전 재설정
- **모든 사용자** 읽기/쓰기 권한
- **YouTube URL/ID** 분리 저장
- **자동 타임스탬프** 생성

## ⚠️ **주의사항**
- 기존 데이터는 **완전히 삭제**됩니다
- 새로운 7명의 참가자만 남게 됩니다
- RLS 정책이 완전히 재설정됩니다

## 🚀 **다음 단계**
SQL 실행 완료 후:
1. **YouTube 데이터 동기화** 실행
2. **프론트엔드**에서 새 데이터 확인
3. **Admin 페이지**에서 관리 기능 테스트
