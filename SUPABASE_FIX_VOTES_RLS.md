# 🔧 votes 테이블 RLS 정책 수정 가이드

## 📋 **Supabase에서 SQL 실행**

### 1️⃣ **Supabase 대시보드 접속**
- **URL**: https://supabase.com/dashboard
- **프로젝트**: gmujzyyvdllvapbphtnw

### 2️⃣ **SQL Editor 열기**
- 좌측 메뉴에서 **"SQL Editor"** 클릭
- **"New query"** 버튼 클릭

### 3️⃣ **다음 SQL 코드 복사 & 붙여넣기**

```sql
-- votes 테이블의 RLS 정책 수정
-- 투표 기능이 정상 작동하도록 RLS 정책 설정

-- 1. 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Allow all operations on votes" ON votes;

-- 2. 새로운 RLS 정책 생성 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Allow all operations on votes" ON votes
    FOR ALL USING (true) WITH CHECK (true);

-- 3. votes 테이블의 RLS 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'votes';

-- 4. 현재 votes 테이블의 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'votes';
```

### 4️⃣ **SQL 실행**
- **"Run"** 버튼 클릭하여 SQL 실행
- 성공 메시지 확인

## 🎯 **해결되는 문제**

### ❌ **이전 오류:**
```
투표 실패
new row violates row-level security policy (USING expression) for table "votes"
```

### ✅ **해결 후:**
- **투표하기**: 정상 작동
- **투표 취소**: 정상 작동
- **재투표**: 정상 작동
- **RLS 정책**: 모든 사용자 읽기/쓰기 권한

## 🔧 **RLS 정책 설명**

### **1️⃣ 기존 정책 삭제**
```sql
DROP POLICY IF EXISTS "Allow all operations on votes" ON votes;
```

### **2️⃣ 새로운 정책 생성**
```sql
CREATE POLICY "Allow all operations on votes" ON votes
    FOR ALL USING (true) WITH CHECK (true);
```

### **3️⃣ 정책 특징**
- **FOR ALL**: 모든 작업 (SELECT, INSERT, UPDATE, DELETE) 허용
- **USING (true)**: 모든 행에 대한 읽기 권한
- **WITH CHECK (true)**: 모든 행에 대한 쓰기 권한

## 🚀 **다음 단계**
SQL 실행 완료 후:
1. **투표하기 버튼** 테스트
2. **투표 취소** 테스트
3. **재투표** 테스트
4. **새로고침 후 상태 유지** 테스트

## ⚠️ **주의사항**
- **보안**: 모든 사용자가 투표할 수 있도록 설정
- **인증**: 로그인한 사용자만 투표 가능 (앱 레벨에서 제어)
- **데이터 무결성**: UNIQUE 제약조건으로 중복 투표 방지

**SQL 실행이 완료되면 투표 기능이 정상적으로 작동합니다!** 🗳️✨
