#!/bin/bash

# 🚀 AI 자동 커밋 스크립트
# 파일 변경사항을 감지하고 자동으로 커밋합니다

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 AI 자동 커밋 시스템 시작...${NC}"

# Git 상태 확인
if ! git status &> /dev/null; then
    echo -e "${RED}❌ Git 저장소가 아닙니다.${NC}"
    exit 1
fi

# 변경사항 확인
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}📝 변경사항이 없습니다.${NC}"
    exit 0
fi

# 변경된 파일들 분석
echo -e "${BLUE}📊 변경사항 분석 중...${NC}"

# 변경된 파일 목록 가져오기
CHANGED_FILES=$(git diff --name-only --cached)
UNSTAGED_FILES=$(git diff --name-only)

# 모든 변경사항을 스테이징
git add .

# 변경사항 타입 분석
COMMIT_TYPE=""
COMMIT_MESSAGE=""

# 파일 타입별 분석
if echo "$CHANGED_FILES $UNSTAGED_FILES" | grep -q "\.tsx\?$"; then
    if echo "$CHANGED_FILES $UNSTAGED_FILES" | grep -q "src/components/"; then
        COMMIT_TYPE="🎨 UI 컴포넌트"
        COMMIT_MESSAGE="컴포넌트 업데이트"
    elif echo "$CHANGED_FILES $UNSTAGED_FILES" | grep -q "src/pages/"; then
        COMMIT_TYPE="📄 페이지"
        COMMIT_MESSAGE="페이지 수정"
    elif echo "$CHANGED_FILES $UNSTAGED_FILES" | grep -q "src/hooks/"; then
        COMMIT_TYPE="🪝 훅"
        COMMIT_MESSAGE="커스텀 훅 업데이트"
    else
        COMMIT_TYPE="⚡ 기능"
        COMMIT_MESSAGE="기능 개선"
    fi
elif echo "$CHANGED_FILES $UNSTAGED_FILES" | grep -q "\.css$"; then
    COMMIT_TYPE="🎨 스타일"
    COMMIT_MESSAGE="스타일 업데이트"
elif echo "$CHANGED_FILES $UNSTAGED_FILES" | grep -q "package\.json$"; then
    COMMIT_TYPE="📦 의존성"
    COMMIT_MESSAGE="패키지 의존성 업데이트"
elif echo "$CHANGED_FILES $UNSTAGED_FILES" | grep -q "\.md$"; then
    COMMIT_TYPE="📝 문서"
    COMMIT_MESSAGE="문서 업데이트"
elif echo "$CHANGED_FILES $UNSTAGED_FILES" | grep -q "\.json$"; then
    COMMIT_TYPE="⚙️ 설정"
    COMMIT_MESSAGE="설정 파일 업데이트"
else
    COMMIT_TYPE="🔧 기타"
    COMMIT_MESSAGE="코드 수정"
fi

# 변경된 파일 수 계산
FILE_COUNT=$(echo "$CHANGED_FILES $UNSTAGED_FILES" | wc -w | tr -d ' ')

# 커밋 메시지 생성
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
FULL_MESSAGE="${COMMIT_TYPE}: ${COMMIT_MESSAGE}

📁 변경된 파일: ${FILE_COUNT}개
🕐 시간: ${TIMESTAMP}
🤖 AI 자동 커밋"

echo -e "${GREEN}📝 커밋 메시지:${NC}"
echo -e "${YELLOW}${FULL_MESSAGE}${NC}"

# 커밋 실행
if git commit -m "$FULL_MESSAGE"; then
    echo -e "${GREEN}✅ 자동 커밋 완료!${NC}"
    echo -e "${BLUE}📊 커밋 정보:${NC}"
    echo -e "   타입: ${COMMIT_TYPE}"
    echo -e "   파일: ${FILE_COUNT}개"
    echo -e "   시간: ${TIMESTAMP}"
else
    echo -e "${RED}❌ 커밋 실패${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 AI 자동 커밋 시스템 완료!${NC}"
