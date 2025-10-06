-- 루이드 참가자 YouTube 영상 직접 수정 SQL

-- 1. 루이드 참가자의 YouTube 영상을 새로운 영상으로 교체
UPDATE contestants 
SET 
  youtube_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtube_id = 'dQw4w9WgXcQ'
WHERE name = '루이드';

-- 2. 수정된 데이터 확인
SELECT name, youtube_url, youtube_id, views, likes 
FROM contestants 
WHERE name = '루이드';
