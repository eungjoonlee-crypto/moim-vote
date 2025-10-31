# 🚀 Vercel 배포 설정 가이드

## 📋 **Vercel 환경변수 설정**

### 1️⃣ **Vercel 대시보드 접속**
- **URL**: https://vercel.com/dashboard
- **프로젝트**: moim-vote

### 2️⃣ **환경변수 설정**
**Settings** → **Environment Variables**에서 다음 변수들 추가:

```
VITE_SUPABASE_URL = https://gmujzyyvdllvapbphtnw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWp6eXl2ZGxsdmFwYnBodG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ4MDgsImV4cCI6MjA3NTI1MDgwOH0.bwuoIIARm9FayJ2zavqUVIywAIjXDsLVlSkemQAxkY0
VITE_YOUTUBE_API_KEY = AIzaSyCI4u_TwWS0PENQOUtPS-409lk5hIHA5YA
```

### 3️⃣ **빌드 설정 확인**
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4️⃣ **재배포 실행**
1. **Deployments** 탭 클릭
2. **최신 배포** → **Redeploy** 클릭
3. **환경변수 적용** 확인

## 🔧 **문제 해결 체크리스트**

### ✅ **환경변수 확인**
- [ ] VITE_SUPABASE_URL 설정됨
- [ ] VITE_SUPABASE_PUBLISHABLE_KEY 설정됨  
- [ ] VITE_YOUTUBE_API_KEY 설정됨

### ✅ **빌드 설정 확인**
- [ ] Framework: Vite
- [ ] Build Command: npm run build
- [ ] Output Directory: dist

### ✅ **Supabase 설정 확인**
- [ ] RLS 정책 활성화
- [ ] OAuth 설정 완료
- [ ] API 키 유효성 확인

## 🎯 **배포 후 확인사항**

### **1️⃣ 사이트 접속**
- **URL**: https://moim-vote.vercel.app/
- **화면**: 정상 로딩 확인

### **2️⃣ 기능 테스트**
- [ ] 로그인/로그아웃
- [ ] 참가자 카드 표시
- [ ] YouTube 영상 재생
- [ ] 투표 기능
- [ ] 관리자 페이지

### **3️⃣ 오류 확인**
- **F12** → **Console** 탭에서 오류 메시지 확인
- **Network** 탭에서 실패한 요청 확인

## 🚨 **일반적인 문제들**

### **❌ 검은 화면**
- **원인**: 환경변수 누락
- **해결**: Vercel에서 환경변수 설정 후 재배포

### **❌ 빌드 실패**
- **원인**: 의존성 설치 실패
- **해결**: Node.js 버전 확인 (18.x 권장)

### **❌ API 오류**
- **원인**: Supabase 연결 실패
- **해결**: API 키 유효성 확인

**환경변수 설정 후 재배포하면 정상 작동합니다!** 🎉✨
