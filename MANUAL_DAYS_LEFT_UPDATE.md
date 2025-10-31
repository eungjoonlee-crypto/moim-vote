# hero_days_left 수동 업데이트 가이드

## 📝 개요
`hero_days_left` 자동 계산 기능을 비활성화하고, 수동으로 원하는 값을 설정할 수 있도록 복구했습니다.

## 🔧 수동 업데이트 방법

### 1단계: Supabase 대시보드 접속
1. [Supabase 대시보드](https://supabase.com/dashboard) 로그인
2. 해당 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭

### 2단계: 현재 상태 확인
```sql
-- 현재 hero_days_left 값 확인
SELECT 
  id,
  hero_days_left,
  hero_title,
  updated_at
FROM site_settings;
```

### 3단계: 원하는 값으로 업데이트
```sql
-- 예시: 3일 남음으로 설정
UPDATE site_settings 
SET 
  hero_days_left = 3,  -- 원하는 숫자로 변경
  updated_at = NOW()
WHERE id IN (SELECT id FROM site_settings LIMIT 1);
```

### 4단계: 결과 확인
```sql
-- 업데이트 결과 확인
SELECT 
  id,
  hero_days_left,
  updated_at
FROM site_settings;
```

## 📋 자주 사용하는 업데이트 예시

### 투표 마감 (0일 남음)
```sql
UPDATE site_settings 
SET hero_days_left = 0, updated_at = NOW() 
WHERE id IN (SELECT id FROM site_settings LIMIT 1);
```

### 1일 남음
```sql
UPDATE site_settings 
SET hero_days_left = 1, updated_at = NOW() 
WHERE id IN (SELECT id FROM site_settings LIMIT 1);
```

### 7일 남음
```sql
UPDATE site_settings 
SET hero_days_left = 7, updated_at = NOW() 
WHERE id IN (SELECT id FROM site_settings LIMIT 1);
```

### 30일 남음
```sql
UPDATE site_settings 
SET hero_days_left = 30, updated_at = NOW() 
WHERE id IN (SELECT id FROM site_settings LIMIT 1);
```

## ✅ 변경사항 요약

### 제거된 기능들
- ❌ 자동 날짜 계산 (클라이언트 사이드)
- ❌ Supabase Edge Function 자동 업데이트
- ❌ GitHub Actions 자동 스케줄링
- ❌ pg_cron 자동 업데이트

### 복구된 기능들
- ✅ 데이터베이스에서 직접 값 읽기
- ✅ 수동 SQL 업데이트 가능
- ✅ 즉시 반영 (캐시 없음)
- ✅ 완전한 제어권

## 🎯 사용법

1. **일반적인 업데이트**: 위의 SQL을 복사하여 실행
2. **빠른 업데이트**: `manual_update_days_left.sql` 파일 사용
3. **대량 업데이트**: 여러 값을 한 번에 설정 가능

## 🔍 문제 해결

### 값이 즉시 반영되지 않는 경우
1. 브라우저 새로고침 (Ctrl+F5)
2. 개발자 도구 > Application > Storage > Clear storage
3. Supabase 캐시 확인

### SQL 실행 오류
1. Supabase 권한 확인
2. 테이블 이름 확인 (`site_settings`)
3. 컬럼 이름 확인 (`hero_days_left`)

## 📞 추가 지원
문제가 발생하면 다음 정보와 함께 문의:
- 현재 `hero_days_left` 값
- 원하는 값
- 오류 메시지 (있는 경우)
