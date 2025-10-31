-- 댓글 수 제한 정책 제거 및 원래 정책으로 복구

-- 제한 정책 삭제
DROP POLICY IF EXISTS "comments_insert_with_limit" ON public.comments;

-- 제한 체크 함수 삭제
DROP FUNCTION IF EXISTS check_user_comment_limit();

-- 원래의 제한 없는 insert 정책 복구
CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT WITH CHECK (true);

-- 확인 메시지
DO $$ 
BEGIN
  RAISE NOTICE '댓글 수 제한이 제거되었습니다. 이제 제한 없이 댓글을 작성할 수 있습니다.';
END $$;

