# 루이드 참가자 YouTube 링크 수정

## 문제 상황
루이드 참가자의 YouTube 링크가 Supabase 데이터베이스에 제대로 업데이트되지 않아서 조회수와 좋아요 수가 0으로 표시되고 있습니다.

## 해결 방법

### 1. Supabase Dashboard 접속
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2. 다음 SQL 코드 실행

```sql
-- 루이드 참가자의 YouTube 링크 수정
UPDATE contestants 
SET 
  youtube_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtube_id = 'dQw4w9WgXcQ'
WHERE name = '루이드';

-- 수정된 데이터 확인
SELECT name, youtube_url, youtube_id, views, likes 
FROM contestants 
WHERE name = '루이드';
```

### 3. 결과 확인
SQL 실행 후 다음과 같은 결과가 나와야 합니다:
```
name | youtube_url                              | youtube_id    | views | likes
-----|------------------------------------------|---------------|-------|-------
루이드 | https://www.youtube.com/watch?v=dQw4w9WgXcQ | dQw4w9WgXcQ   | 0     | 0
```

### 4. YouTube 데이터 동기화
SQL 실행 후 다시 동기화를 실행하면 루이드 참가자의 실제 YouTube 데이터가 가져와집니다.

## 추가 확인 사항

### 현재 데이터베이스 상태 확인
```sql
-- 모든 참가자의 YouTube 링크 확인
SELECT name, youtube_url, youtube_id, views, likes 
FROM contestants 
ORDER BY name;
```

### 루이드 참가자만 확인
```sql
-- 루이드 참가자 상세 정보
SELECT * FROM contestants WHERE name = '루이드';
```

## 문제 해결 후

1. **SQL 실행 완료** 후
2. **개발 서버에서 동기화** 실행
3. **메인 페이지**에서 루이드 참가자 데이터 확인
4. **Admin 페이지**에서 수정된 링크 확인

이제 루이드 참가자의 YouTube 데이터가 정상적으로 표시될 것입니다.
