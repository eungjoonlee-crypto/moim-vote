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
