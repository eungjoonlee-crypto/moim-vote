# 🗳️ 투표 수 DB 연동 수정 가이드

## ⚠️ 문제 상황
투표 수가 DB와 제대로 연동되지 않는 문제가 발생했습니다.

## ✅ 해결 방법

### 1️⃣ **Supabase 대시보드 접속**
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (gmujzyyvdllvapbphtnw)

### 2️⃣ **SQL Editor 열기**
1. 좌측 메뉴에서 **"SQL Editor"** 클릭
2. **"New query"** 버튼 클릭

### 3️⃣ **SQL 스크립트 실행**
1. `fix_vote_count.sql` 파일의 내용을 복사
2. SQL Editor에 붙여넣기
3. **"Run"** 버튼 클릭하여 실행

### 4️⃣ **결과 확인**
실행 후 마지막에 다음과 같은 결과가 표시됩니다:
- 각 참가자의 `vote_count`와 `actual_votes`가 일치하는지 확인
- 일치하면 정상적으로 설정된 것입니다

## 🔧 수정 내용

### 데이터베이스 변경사항:
1. ✅ `contestants` 테이블에 `vote_count` 컬럼 추가
2. ✅ 기존 투표 데이터를 기반으로 `vote_count` 동기화
3. ✅ 투표 추가/삭제 시 자동으로 `vote_count` 업데이트되는 트리거 생성

### 코드 변경사항:
1. ✅ `Index.tsx`: vote_count가 없어도 기본값 0으로 작동하도록 수정
2. ✅ `ContestantCard.tsx`: 이미 실시간 투표 수 조회 기능 구현됨

## 🎯 작동 방식

### 자동 동기화
- 사용자가 투표하면 → `votes` 테이블에 저장
- 트리거가 자동으로 → `contestants.vote_count` 업데이트
- 화면에 즉시 반영됨

### 실시간 조회
- `ContestantCard` 컴포넌트가 로드될 때마다
- `votes` 테이블에서 실제 투표 수를 조회
- 최신 투표 수가 화면에 표시됨

## 📊 테스트 방법

1. **투표하기**:
   - 참가자 카드에서 "투표하기" 버튼 클릭
   - 하트 개수가 즉시 증가하는지 확인

2. **투표 취소**:
   - "투표 취소" 버튼 클릭
   - 하트 개수가 즉시 감소하는지 확인

3. **새로고침**:
   - 페이지 새로고침
   - 투표 수가 유지되는지 확인

## ❓ 문제 해결

### 투표 수가 여전히 0으로 표시되는 경우:
```sql
-- Supabase SQL Editor에서 실행
SELECT 
    c.name, 
    c.vote_count,
    COUNT(v.id) as actual_votes
FROM contestants c
LEFT JOIN votes v ON v.contestant_id = c.id
GROUP BY c.id, c.name, c.vote_count;
```

이 쿼리로 `vote_count`와 `actual_votes`가 일치하는지 확인하세요.

### 트리거가 작동하지 않는 경우:
```sql
-- 수동으로 동기화
UPDATE contestants 
SET vote_count = (
    SELECT COUNT(*)::INTEGER 
    FROM votes 
    WHERE votes.contestant_id = contestants.id
);
```

## 🚀 완료 후
- 코드 변경사항 커밋 및 푸시
- Vercel 자동 배포 확인
- 실제 사이트에서 투표 기능 테스트

---

**참고**: 이 수정은 한 번만 실행하면 됩니다. 이후 모든 투표는 자동으로 DB와 동기화됩니다.

