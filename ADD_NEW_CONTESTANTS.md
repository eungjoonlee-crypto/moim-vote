# 새로운 참가자 추가 가이드

총 17명의 참가자로 확장하기 위해 새로운 참가자 8명(8호~17호)을 추가합니다.

## 1. Supabase에서 새로운 참가자 추가

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 "SQL Editor" 클릭
4. 아래 SQL 코드를 복사하여 실행

## 2. SQL 코드

```sql
-- 새로운 참가자 8명 추가 (8호~17호)
INSERT INTO public.contestants (name, song, youtube_url, youtube_id, views, likes, vote_count) VALUES
('가수 8호', '도마뱀', 'https://www.youtube.com/watch?v=-Yq1_IMCSFI', '-Yq1_IMCSFI', 0, 0, 0),
('가수 9호', 'Silent Night', 'https://www.youtube.com/watch?v=pK4hQ3WyV-o', 'pK4hQ3WyV-o', 0, 0, 0),
('가수 10호', '채워줘', 'https://www.youtube.com/watch?v=dzglVNm5xfU', 'dzglVNm5xfU', 0, 0, 0),
('가수 11호', 'Stay', 'https://www.youtube.com/watch?v=TeLxVP_vW9I', 'TeLxVP_vW9I', 0, 0, 0),
('가수 12호', 'gr8', 'https://www.youtube.com/watch?v=u_fFSVKvtPk', 'u_fFSVKvtPk', 0, 0, 0),
('가수 13호', 'dryflower', 'https://www.youtube.com/watch?v=40vY3fK-BZs', '40vY3fK-BZs', 0, 0, 0),
('가수 14호', '지워본다', 'https://www.youtube.com/watch?v=Ya3AQLaosL8', 'Ya3AQLaosL8', 0, 0, 0),
('가수 15호', 'Photosynthesis', 'https://www.youtube.com/watch?v=c6-yM6nUJY0', 'c6-yM6nUJY0', 0, 0, 0),
('가수 16호', '흐드러지게', 'https://www.youtube.com/watch?v=LBinPPPPPJw', 'LBinPPPPPJw', 0, 0, 0),
('가수 17호', '멍하니', 'https://www.youtube.com/watch?v=tXcoAlhyZeU', 'tXcoAlhyZeU', 0, 0, 0);
```

## 3. 추가된 참가자 목록

- **가수 8호** - 도마뱀
- **가수 9호** - Silent Night  
- **가수 10호** - 채워줘
- **가수 11호** - Stay
- **가수 12호** - gr8
- **가수 13호** - dryflower
- **가수 14호** - 지워본다
- **가수 15호** - Photosynthesis
- **가수 16호** - 흐드러지게
- **가수 17호** - 멍하니

## 4. 기능 확인

추가된 참가자들은 기존 참가자들과 동일한 기능을 제공합니다:

- ✅ YouTube 영상 임베드 및 자동 재생
- ✅ 투표 기능 (하트 아이콘)
- ✅ 댓글 기능
- ✅ 공유 기능
- ✅ YouTube 조회수/좋아요 수 동기화
- ✅ 검색 기능

## 5. 관리자 페이지

관리자 페이지에서 새로운 참가자들을 관리할 수 있습니다:
- 참가자 정보 수정
- YouTube URL 변경
- 개별 동기화
- 전체 동기화

## 6. 주의사항

- 모든 참가자는 동일한 포맷과 기능을 가집니다
- YouTube 영상은 자동으로 임베드됩니다
- 투표와 댓글은 실시간으로 동기화됩니다
- 검색 기능으로 모든 참가자를 찾을 수 있습니다
