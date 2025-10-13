# 참가자 데이터 초기화 및 재설정 가이드

## ⚠️ 중요 안내

이 작업은 **모든 기존 참가자, 투표, 댓글 데이터를 삭제**합니다!
- 기존 참가자 데이터
- 모든 투표 데이터
- 모든 댓글 데이터

작업을 진행하기 전에 반드시 데이터 백업을 권장합니다.

---

## 📋 새로운 참가자 목록

| 번호 | 가수명 | 노래제목 | 유튜브 링크 |
|------|--------|----------|-------------|
| 1호 | 1호 가수 | The Door | [링크](https://youtu.be/sDeVLXh4uc4) |
| 2호 | 2호 가수 | Start A Fire | [링크](https://youtu.be/-ynaaTrDZM8) |
| 3호 | 3호 가수 | 아니라고 말해요(율) | [링크](https://youtu.be/IChUNQ79wG4) |
| 4호 | 4호 가수 | Music | [링크](https://youtu.be/j6M6Jfxzr6s) |
| 5호 | 5호 가수 | 심규선 | [링크](https://youtu.be/swqBMZ3FlNg) |
| 6호 | 6호 가수 | Don't Rain On My Parade (Glee OST) | [링크](https://youtu.be/p_oIlBEXTL8) |
| 7호 | 7호 가수 | 서울의 달 | [링크](https://youtu.be/Gz6o0a7xfTQ) |
| 8호 | 8호 가수 | 입술의 말 | [링크](https://youtu.be/RiL464NrDho) |

---

## 🚀 실행 방법

### 1. Supabase 대시보드 접속
1. [Supabase](https://supabase.com) 대시보드에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭

### 2. SQL 스크립트 실행
1. **New Query** 버튼 클릭
2. `reset_contestants.sql` 파일의 내용을 복사하여 붙여넣기
3. **Run** 버튼 클릭하여 실행

### 3. 결과 확인
스크립트 실행 후 다음과 같은 결과가 표시됩니다:
- 8명의 새로운 참가자가 추가됨
- 모든 참가자의 초기 통계 (views, likes, vote_count)가 0으로 설정됨

---

## 📊 실행 후 확인 사항

### 웹사이트에서 확인
1. 웹사이트 새로고침 (Ctrl/Cmd + Shift + R)
2. 8명의 새로운 참가자 카드가 표시되는지 확인
3. 각 카드의 YouTube 영상이 정상적으로 재생되는지 확인

### 데이터베이스에서 확인
```sql
-- 참가자 수 확인
SELECT COUNT(*) FROM contestants;
-- 결과: 8

-- 모든 참가자 정보 확인
SELECT id, name, song, youtube_id FROM contestants ORDER BY id;
```

---

## 🔧 문제 해결

### 외래 키 오류가 발생하는 경우
```sql
-- 외래 키 제약 조건을 일시적으로 비활성화
SET session_replication_role = 'replica';

-- 데이터 삭제
DELETE FROM comments;
DELETE FROM votes;
DELETE FROM contestants;

-- 외래 키 제약 조건 다시 활성화
SET session_replication_role = 'origin';
```

### 시퀀스 초기화가 안 되는 경우
```sql
-- 수동으로 시퀀스 확인 및 초기화
SELECT setval('contestants_id_seq', 1, false);
SELECT setval('votes_id_seq', 1, false);
SELECT setval('comments_id_seq', 1, false);
```

---

## ✅ 완료 체크리스트

- [ ] 기존 데이터 백업 완료 (선택사항)
- [ ] `reset_contestants.sql` 스크립트 실행
- [ ] 8명의 참가자가 데이터베이스에 추가되었는지 확인
- [ ] 웹사이트에서 새로운 참가자 카드가 표시되는지 확인
- [ ] YouTube 영상 재생이 정상적으로 작동하는지 확인
- [ ] 투표 기능이 정상적으로 작동하는지 테스트

---

## 📝 참고사항

- YouTube 영상 ID는 URL에서 자동으로 추출됩니다
- 초기 조회수, 좋아요, 투표수는 모두 0으로 설정됩니다
- YouTube API를 통한 자동 동기화가 활성화되어 있으면 조회수와 좋아요는 자동으로 업데이트됩니다

---

## 🆘 도움이 필요한 경우

문제가 발생하면 다음을 확인하세요:
1. Supabase 프로젝트가 정상적으로 연결되어 있는지
2. RLS (Row Level Security) 정책이 올바르게 설정되어 있는지
3. 데이터베이스 테이블 구조가 올바른지 (`contestants`, `votes`, `comments`)

필요시 `fix_rls_policies.sql` 및 `fix_vote_count.sql` 스크립트를 다시 실행하세요.

