# 🎉 응원하기 기능 설정 가이드

## 📋 **Supabase에서 SQL 실행**

### 1️⃣ **Supabase 대시보드 접속**
- **URL**: https://supabase.com/dashboard
- **프로젝트**: gmujzyyvdllvapbphtnw

### 2️⃣ **SQL Editor 열기**
- 좌측 메뉴에서 **"SQL Editor"** 클릭
- **"New query"** 버튼 클릭

### 3️⃣ **다음 SQL 코드 복사 & 붙여넣기**

```sql
-- 응원하기 기능을 위한 테이블 생성
-- 사용자가 참가자에게 응원을 표시하는 기능

-- 1. 응원 테이블 생성
CREATE TABLE IF NOT EXISTS cheers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contestant_id UUID NOT NULL REFERENCES contestants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contestant_id) -- 한 사용자가 한 참가자에게 중복 응원 방지
);

-- 2. RLS 정책 설정
ALTER TABLE cheers ENABLE ROW LEVEL SECURITY;

-- 3. 모든 사용자가 읽기/쓰기 가능하도록 정책 설정
CREATE POLICY "Allow all operations on cheers" ON cheers
    FOR ALL USING (true) WITH CHECK (true);

-- 4. 응원 수를 계산하는 함수 생성
CREATE OR REPLACE FUNCTION get_cheer_count(contestant_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM cheers 
        WHERE contestant_id = contestant_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 사용자의 응원 상태를 확인하는 함수 생성
CREATE OR REPLACE FUNCTION is_user_cheered(user_uuid UUID, contestant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS(
            SELECT 1 
            FROM cheers 
            WHERE user_id = user_uuid AND contestant_id = contestant_uuid
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4️⃣ **SQL 실행**
- **"Run"** 버튼 클릭하여 SQL 실행
- 성공 메시지 확인

## 🎯 **생성되는 기능**

### ✅ **응원 테이블 (`cheers`)**
- **사용자별 응원 기록** 저장
- **중복 응원 방지** (UNIQUE 제약조건)
- **자동 삭제** (사용자/참가자 삭제 시)

### ✅ **응원 수 계산 함수**
- **`get_cheer_count(contestant_uuid)`**: 특정 참가자의 총 응원 수 반환
- **실시간 계산**: 데이터베이스에서 직접 계산

### ✅ **응원 상태 확인 함수**
- **`is_user_cheered(user_uuid, contestant_uuid)`**: 사용자가 특정 참가자에게 응원했는지 확인
- **상태 유지**: 새로고침 후에도 응원 상태 유지

## 🚀 **다음 단계**
SQL 실행 완료 후:
1. **ContestantCard 컴포넌트** 업데이트
2. **응원하기 기능** 구현
3. **응원 수 표시** 기능 추가
4. **상태 유지** 기능 테스트
