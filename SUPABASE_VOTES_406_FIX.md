# Supabase Votes 테이블 406 오류 수정 가이드

## 🚨 문제 상황
- 투표 기능에서 406 (Not Acceptable) 오류 발생
- RLS(Row Level Security) 정책 문제로 votes 테이블 접근 불가

## 🔧 해결 방법

### 1단계: Supabase 대시보드 접속
1. [Supabase 대시보드](https://supabase.com/dashboard) 로그인
2. 해당 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭

### 2단계: RLS 정책 수정 SQL 실행
아래 SQL을 복사하여 실행:

```sql
-- 간단한 votes 테이블 406 오류 수정
-- 모든 기존 정책을 삭제하고 완전히 허용하는 정책으로 교체

-- 1. 모든 기존 정책 삭제
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'votes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.votes';
    END LOOP;
END $$;

-- 2. RLS 활성화 확인
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- 3. 단일 허용 정책 생성 (모든 작업 허용)
CREATE POLICY "votes_complete_access" ON public.votes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 4. 결과 확인
SELECT 
  'votes' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'votes';
```

### 3단계: 결과 확인
- SQL 실행 후 "Success" 메시지 확인
- `policy_count`가 1이 표시되어야 함

### 4단계: 웹사이트에서 테스트
1. 브라우저에서 투표 기능 테스트
2. 개발자 도구 콘솔에서 406 오류가 사라졌는지 확인
3. 투표/투표 취소가 정상 작동하는지 확인

## 🔍 추가 확인사항

### 현재 votes 테이블 상태 확인
```sql
-- votes 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'votes' 
ORDER BY ordinal_position;

-- 현재 정책 확인
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'votes';
```

### 문제가 지속되는 경우
1. **Authentication 설정 확인**
   - Supabase > Authentication > Settings
   - RLS가 올바르게 설정되어 있는지 확인

2. **테이블 권한 확인**
   - Supabase > Database > Tables
   - votes 테이블의 권한 설정 확인

3. **브라우저 캐시 클리어**
   - Ctrl+Shift+R (하드 리프레시)
   - 개발자 도구 > Application > Storage > Clear storage

## ✅ 성공 확인
- 투표 버튼 클릭 시 406 오류 없음
- 투표 수가 정상적으로 업데이트됨
- 투표 취소 기능 정상 작동
- 콘솔에 오류 메시지 없음

## 📞 추가 지원
문제가 지속되면 다음 정보와 함께 문의:
- Supabase 프로젝트 URL
- 오류 발생 시점
- 브라우저 콘솔의 전체 오류 메시지
