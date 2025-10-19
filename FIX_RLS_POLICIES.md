# 🔒 투표 수 DB 연동 문제 해결 가이드

## ⚠️ 문제 증상
- 화면에 표시되는 하트 수와 실제 투표 버튼 클릭 수가 일치하지 않음
- 투표를 해도 하트 수가 증가하지 않거나 잘못된 값이 표시됨

## 🔍 원인
Supabase의 **RLS (Row Level Security)** 정책이 올바르게 설정되지 않아:
1. 투표 수를 조회할 권한이 없음
2. 투표 데이터 접근이 차단됨

## ✅ 해결 방법

### 1️⃣ **Supabase 대시보드 접속**
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (gmujzyyvdllvapbphtnw)

### 2️⃣ **SQL Editor 열기**
1. 좌측 메뉴에서 **"SQL Editor"** 클릭
2. **"New query"** 버튼 클릭

### 3️⃣ **RLS 정책 수정 SQL 실행**

#### 단계 1: vote_count 컬럼 추가 (아직 안했다면)
```sql
-- fix_vote_count.sql 파일 내용 복사하여 실행
```

#### 단계 2: RLS 정책 수정
```sql
-- fix_rls_policies.sql 파일 내용 복사하여 실행
```

### 4️⃣ **결과 확인**
실행 후 다음을 확인:
1. 정책 목록 확인 (마지막에서 두 번째 쿼리 결과)
2. 투표 수 확인 (마지막 쿼리 결과)

## 🎯 수정된 RLS 정책

### votes 테이블:
- ✅ **조회 (SELECT)**: 모든 사용자 가능 (로그인 불필요)
  - 투표 수 조회를 위해 필요
- ✅ **추가 (INSERT)**: 인증된 사용자만 가능
  - 자신의 user_id로만 투표 가능
- ✅ **삭제 (DELETE)**: 자신의 투표만 삭제 가능
  - 투표 취소 기능

### contestants 테이블:
- ✅ **조회 (SELECT)**: 모든 사용자 가능
  - 참가자 정보 조회

### comments 테이블:
- ✅ **조회 (SELECT)**: 모든 사용자 가능
- ✅ **추가 (INSERT)**: 인증된 사용자만 가능
- ✅ **삭제 (DELETE)**: 자신의 댓글만 삭제 가능

## 🔧 코드 변경사항

### ContestantCard.tsx
- ✅ 디버깅 로그 추가
- ✅ 투표 수 실시간 조회 강화
- ✅ 에러 처리 개선

### 로그 확인 방법
브라우저 개발자 도구 (F12) → Console 탭에서:
```
[참가자명] Fetching vote count for contestant: [ID]
[참가자명] Vote count fetched: [숫자]
[참가자명] Inserting vote for user: [USER_ID]
[참가자명] Vote inserted successfully
```

## 📊 테스트 방법

### 1. 브라우저 콘솔 열기
- Chrome/Edge: F12 또는 Cmd+Option+I (Mac)
- Console 탭 선택

### 2. 투표하기
1. "투표하기" 버튼 클릭
2. 콘솔에서 다음 로그 확인:
   ```
   [참가자명] Inserting vote for user: xxx-xxx-xxx
   [참가자명] Vote inserted successfully
   [참가자명] Fetching vote count for contestant: xxx-xxx-xxx
   [참가자명] Vote count fetched: 1
   ```
3. 화면에 하트 수가 1 증가했는지 확인

### 3. 투표 취소
1. "투표 취소" 버튼 클릭
2. 콘솔에서 다음 로그 확인:
   ```
   [참가자명] Deleting vote for user: xxx-xxx-xxx
   [참가자명] Vote deleted successfully
   [참가자명] Fetching vote count for contestant: xxx-xxx-xxx
   [참가자명] Vote count fetched: 0
   ```
3. 화면에 하트 수가 1 감소했는지 확인

### 4. 새로고침 후 확인
1. 페이지 새로고침 (F5)
2. 투표 수가 유지되는지 확인
3. 로그인 상태라면 투표 상태(하트 채워짐)가 유지되는지 확인

## ❓ 문제 해결

### 여전히 투표 수가 0으로 표시되는 경우

#### 1. RLS 정책 확인
```sql
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'votes';
```

다음 정책이 있어야 합니다:
- `Anyone can view votes count` (SELECT)
- `Authenticated users can insert votes` (INSERT)
- `Users can delete their own votes` (DELETE)

#### 2. 투표 데이터 확인
```sql
SELECT 
    c.name,
    COUNT(v.id) as actual_votes,
    c.vote_count
FROM contestants c
LEFT JOIN votes v ON v.contestant_id = c.id
GROUP BY c.id, c.name, c.vote_count;
```

`actual_votes`와 `vote_count`가 일치해야 합니다.

#### 3. 권한 확인
```sql
-- 익명 사용자로 votes 조회 테스트
SELECT COUNT(*) FROM votes WHERE contestant_id = 'CONTESTANT_ID';
```

에러가 나지 않고 숫자가 나와야 합니다.

### 에러 메시지가 나오는 경우

#### "new row violates row-level security policy"
→ INSERT 정책이 올바르게 설정되지 않음
```sql
-- fix_rls_policies.sql 다시 실행
```

#### "permission denied for table votes"
→ RLS가 비활성화되었거나 정책이 없음
```sql
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
-- fix_rls_policies.sql 다시 실행
```

## 🚀 완료 후 체크리스트

- [ ] fix_vote_count.sql 실행 완료
- [ ] fix_rls_policies.sql 실행 완료
- [ ] 정책 목록 확인 완료
- [ ] 투표 수 일치 확인 완료
- [ ] 브라우저에서 투표 테스트 완료
- [ ] 콘솔 로그 정상 확인 완료
- [ ] 새로고침 후 데이터 유지 확인 완료

## 📝 참고사항

### RLS란?
Row Level Security (행 수준 보안)는 Supabase/PostgreSQL의 보안 기능으로:
- 누가 어떤 데이터를 읽고/쓸 수 있는지 제어
- 테이블별로 세밀한 권한 설정 가능
- SQL 정책으로 규칙 정의

### 왜 votes 테이블은 모두에게 SELECT를 허용하나요?
- 투표 **수**만 공개되며, 누가 투표했는지는 알 수 없음
- COUNT 쿼리만 실행하므로 개인 정보 노출 없음
- 실시간 투표 현황 표시를 위해 필요

---

**중요**: SQL 실행 후 브라우저를 완전히 새로고침(Ctrl+F5 또는 Cmd+Shift+R)하여 캐시를 지우세요!

