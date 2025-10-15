# 남은 일수 자동 업데이트 설정 가이드

2025년 10월 22일까지 남은 일수를 자동으로 계산하고 매일 자정에 업데이트하는 기능입니다.

## 📋 개요

- **목표 날짜**: 2025년 10월 22일
- **업데이트 주기**: 매일 자정 (한국 시간 00:00)
- **대상 필드**: `site_settings.hero_days_left`
- **자동화 방식**: PostgreSQL 함수 + pg_cron (또는 대안 방법)

## 🔧 Supabase 설정

### 방법 1: pg_cron 사용 (권장)

#### 1. Supabase 대시보드 접속

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭

#### 2. SQL 실행

`auto_update_days_left.sql` 파일의 내용을 복사하여 실행하세요.

```sql
-- 전체 SQL 코드 실행
```

#### 3. 실행 확인

SQL 실행 후 다음과 같은 결과가 표시되어야 합니다:

```
NOTICE: 남은 일수가 업데이트되었습니다: 8일
```

#### 4. pg_cron 확인

**중요**: Supabase의 무료 플랜에서는 `pg_cron` 확장이 제한될 수 있습니다.

확인 방법:
```sql
-- pg_cron 확장이 설치되어 있는지 확인
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- 크론 작업 목록 조회
SELECT * FROM cron.job;
```

**에러 발생 시**: `ERROR: extension "pg_cron" is not available`
→ **방법 2: Edge Function 대안** 사용

---

### 방법 2: Supabase Edge Function (대안)

pg_cron을 사용할 수 없는 경우, Supabase Edge Function과 외부 크론 서비스를 사용합니다.

#### 1. Edge Function 생성

파일: `supabase/functions/update-days-left/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    // Supabase 클라이언트 초기화
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 목표 날짜: 2025년 10월 22일
    const targetDate = new Date('2025-10-22');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정

    // 남은 일수 계산
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = diffDays < 0 ? 0 : diffDays;

    // site_settings 업데이트
    const { data, error } = await supabase
      .from('site_settings')
      .update({
        hero_days_left: daysLeft,
        updated_at: new Date().toISOString()
      })
      .eq('id', (await supabase.from('site_settings').select('id').limit(1).single()).data?.id);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        daysLeft,
        message: `남은 일수가 ${daysLeft}일로 업데이트되었습니다.`,
        updatedAt: new Date().toISOString()
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
```

#### 2. Edge Function 배포

```bash
# Supabase CLI로 배포
supabase functions deploy update-days-left
```

#### 3. 외부 크론 서비스 설정

**GitHub Actions** (무료, 권장)

파일: `.github/workflows/update-days-left.yml`

```yaml
name: Update Days Left Daily

on:
  schedule:
    # 매일 UTC 15:00 (한국 시간 자정)
    - cron: '0 15 * * *'
  workflow_dispatch: # 수동 실행 가능

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST \
            https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-days-left \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

**또는 cron-job.org** (무료 웹 크론 서비스)

1. https://cron-job.org 접속
2. 계정 생성 후 새 크론 작업 추가
3. URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-days-left`
4. 스케줄: 매일 00:00 (한국 시간)

---

### 방법 3: 클라이언트 측 자동 업데이트 (간단한 대안)

프론트엔드에서 자동으로 계산하도록 수정

파일: `src/pages/Index.tsx`

```typescript
// fetchSettings 함수 수정
const fetchSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.warn('site_settings fetch error:', error.message);
    }
    
    if (data) {
      // 클라이언트 측에서 남은 일수 계산
      const targetDate = new Date('2025-10-22');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = targetDate.getTime() - today.getTime();
      const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      
      // 계산된 값으로 덮어쓰기
      const updatedSettings = {
        ...data,
        hero_days_left: daysLeft
      };
      
      setSiteSettings(updatedSettings as SiteSettings);
      
      // ... 나머지 코드
    }
  } catch (error) {
    console.error('Settings fetch error:', error);
  }
};
```

---

## 📊 현재 상태 확인

### SQL로 확인

```sql
-- 현재 설정 조회
SELECT 
  hero_title,
  hero_days_left,
  updated_at
FROM public.site_settings;

-- 함수로 계산된 값 확인
SELECT calculate_days_left() as days_remaining;

-- 크론 작업 확인 (pg_cron 사용 시)
SELECT * FROM cron.job WHERE jobname = 'update-days-left-daily';
```

### 수동 업데이트 테스트

```sql
-- 수동으로 업데이트 실행
SELECT update_hero_days_left();

-- 결과 확인
SELECT hero_days_left, updated_at FROM public.site_settings;
```

---

## 🧪 테스트

### 1. 함수 테스트

```sql
-- 남은 일수 계산 테스트
SELECT calculate_days_left();
-- 결과: 8 (2025년 10월 14일 기준)

-- 업데이트 함수 테스트
SELECT update_hero_days_left();
-- 결과: NOTICE: 남은 일수가 업데이트되었습니다: 8일
```

### 2. 자동 업데이트 테스트

**pg_cron 사용 시:**
```sql
-- 크론 작업 즉시 실행 (테스트용)
SELECT cron.schedule_in_database('test-update', '* * * * *', $$SELECT update_hero_days_left();$$);
-- 1분 후 확인
SELECT hero_days_left, updated_at FROM public.site_settings;
-- 테스트 작업 삭제
SELECT cron.unschedule('test-update');
```

**Edge Function 사용 시:**
```bash
# 수동으로 호출 테스트
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-days-left \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 🔍 문제 해결

### pg_cron 사용 불가

**증상**: `ERROR: extension "pg_cron" is not available`

**해결책**:
1. Supabase 프로 플랜으로 업그레이드
2. 또는 **방법 2 (Edge Function)** 또는 **방법 3 (클라이언트 측)** 사용

### 크론 작업이 실행되지 않음

**확인 사항**:
```sql
-- 크론 작업 상태 확인
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'update-days-left-daily')
ORDER BY start_time DESC
LIMIT 10;
```

### 시간대 문제

pg_cron은 UTC 시간을 사용합니다.
- 한국 시간 00:00 = UTC 15:00 (전날)
- 크론 표현식: `0 15 * * *`

---

## 📝 유지보수

### 목표 날짜 변경

날짜를 변경하려면:

```sql
-- 함수 수정
CREATE OR REPLACE FUNCTION calculate_days_left()
RETURNS INTEGER AS $$
DECLARE
  target_date DATE := '2025-12-31';  -- 새로운 날짜로 변경
  days_remaining INTEGER;
BEGIN
  days_remaining := target_date - CURRENT_DATE;
  IF days_remaining < 0 THEN
    days_remaining := 0;
  END IF;
  RETURN days_remaining;
END;
$$ LANGUAGE plpgsql;

-- 즉시 업데이트
SELECT update_hero_days_left();
```

### 크론 스케줄 변경

```sql
-- 기존 작업 삭제
SELECT cron.unschedule('update-days-left-daily');

-- 새로운 스케줄로 등록 (예: 매일 오전 9시)
SELECT cron.schedule(
  'update-days-left-daily',
  '0 0 * * *',  -- 매일 UTC 00:00 (한국 시간 오전 9시)
  $$SELECT update_hero_days_left();$$
);
```

---

## 🎯 권장 방법 요약

| 방법 | 장점 | 단점 | 권장 대상 |
|------|------|------|-----------|
| **방법 1: pg_cron** | 완전 자동화, 서버 측 실행 | Supabase 프로 플랜 필요 | 유료 플랜 사용자 |
| **방법 2: Edge Function** | 무료, 안정적, 서버 측 실행 | 설정이 복잡함 | 무료 플랜 + 기술적 역량 |
| **방법 3: 클라이언트** | 가장 간단, 즉시 적용 | 페이지 로드 시에만 계산 | 간단한 솔루션 선호 |

**추천**: 무료 플랜이면 **방법 3 (클라이언트 측)**, 프로 플랜이면 **방법 1 (pg_cron)**

---

## 📊 현재 남은 일수

2025년 10월 14일 기준:
- 목표: 2025년 10월 22일
- **남은 일수: 8일**

자동 업데이트가 설정되면 매일 자정에 자동으로 1씩 감소합니다.

