# 🗳️ 투표 수 DB 스키마 설정 가이드

## 📋 **Supabase에서 SQL 실행**

### 1️⃣ **Supabase 대시보드 접속**
- **URL**: https://supabase.com/dashboard
- **프로젝트**: gmujzyyvdllvapbphtnw

### 2️⃣ **SQL Editor 열기**
- 좌측 메뉴에서 **"SQL Editor"** 클릭
- **"New query"** 버튼 클릭

### 3️⃣ **다음 SQL 코드 복사 & 붙여넣기**

```sql
-- 투표 수를 위한 DB 스키마 설정
-- contestants 테이블에 vote_count 컬럼 추가

-- 1. contestants 테이블에 vote_count 컬럼 추가
ALTER TABLE contestants 
ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;

-- 2. 기존 데이터의 vote_count를 0으로 초기화
UPDATE contestants 
SET vote_count = 0 
WHERE vote_count IS NULL;

-- 3. vote_count 컬럼을 NOT NULL로 설정
ALTER TABLE contestants 
ALTER COLUMN vote_count SET NOT NULL;

-- 4. 투표 수를 업데이트하는 함수 생성
CREATE OR REPLACE FUNCTION update_vote_count(contestant_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    vote_count INTEGER;
BEGIN
    -- 해당 참가자의 총 투표 수 계산
    SELECT COUNT(*)::INTEGER INTO vote_count
    FROM votes 
    WHERE contestant_id = contestant_uuid;
    
    -- contestants 테이블의 vote_count 업데이트
    UPDATE contestants 
    SET vote_count = vote_count 
    WHERE id = contestant_uuid;
    
    RETURN vote_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 모든 참가자의 vote_count를 현재 투표 수로 동기화
UPDATE contestants 
SET vote_count = (
    SELECT COUNT(*)::INTEGER 
    FROM votes 
    WHERE votes.contestant_id = contestants.id
);

-- 6. 결과 확인
SELECT 
    id,
    name, 
    song, 
    vote_count,
    views,
    likes
FROM contestants 
ORDER BY created_at;
```

### 4️⃣ **SQL 실행**
- **"Run"** 버튼 클릭하여 SQL 실행
- 성공 메시지 확인

## 🎯 **생성되는 기능**

### ✅ **vote_count 컬럼 추가**
- **데이터 타입**: INTEGER
- **기본값**: 0
- **NOT NULL**: 필수 값
- **용도**: 참가자의 총 투표 수(하트 개수) 저장

### ✅ **update_vote_count 함수**
- **기능**: 특정 참가자의 투표 수를 계산하여 vote_count 업데이트
- **반환값**: 업데이트된 투표 수
- **사용법**: `SELECT update_vote_count('contestant_uuid');`

### ✅ **자동 동기화**
- **기존 투표 수**: 현재 votes 테이블의 데이터로 vote_count 초기화
- **실시간 업데이트**: 투표 시 vote_count 자동 업데이트

## 🚀 **다음 단계**
SQL 실행 완료 후:
1. **ContestantCard 컴포넌트** 업데이트 완료
2. **투표 기능** 테스트
3. **투표 취소 후 재투표** 테스트
4. **하트 아이콘 표시** 확인

## 📊 **예상 결과**
```sql
id | name  | song | vote_count | views    | likes
---|-------|------|------------|----------|-------
1  | 루이소| 옆   | 0          | 7,836    | 70
2  | 루이드| 뒤   | 0          | 9,604    | 38
3  | 로이드| 앞   | 0          | 13,064   | 89
...
```

## 🎯 **UI 표시**
```
👁️ 조회수: 1,234,567  (YouTube 조회수)
👍 좋아요: 12,345      (YouTube 좋아요)
❤️ 투표수: 0           (사용자 투표 수 - 하트 아이콘)
```

**모든 참가자의 vote_count가 0으로 초기화되고, 투표 시 자동으로 업데이트됩니다!** 🗳️✨
