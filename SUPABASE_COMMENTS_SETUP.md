# Supabase Comments 테이블 설정

댓글 기능이 제대로 작동하려면 Supabase에서 `comments` 테이블을 생성해야 합니다.

## 1. Supabase 대시보드에서 SQL 실행

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 "SQL Editor" 클릭
4. 아래 SQL 코드를 복사하여 실행

## 2. SQL 코드

```sql
-- comments 테이블 생성
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contestant_id UUID NOT NULL REFERENCES public.contestants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "comments_read" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "comments_update" ON public.comments
  FOR UPDATE USING (true);

CREATE POLICY "comments_delete" ON public.comments
  FOR DELETE USING (true);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_comments_contestant_id ON public.comments(contestant_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);
```

## 3. 확인사항

- 테이블이 성공적으로 생성되었는지 확인
- RLS 정책이 올바르게 설정되었는지 확인
- 댓글 기능이 정상적으로 작동하는지 테스트

## 4. 문제 해결

만약 오류가 발생한다면:
1. `contestants` 테이블이 존재하는지 확인
2. `auth.users` 테이블이 존재하는지 확인
3. 권한이 올바르게 설정되었는지 확인
