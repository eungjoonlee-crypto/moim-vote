-- 직접 SQL로 참가자 데이터 수정

-- 1. 루이드 참가자 수정 (YouTube ID 추출)
UPDATE contestants 
SET 
  youtube_id = 'IE0d6xLSEvI',
  youtube_url = 'https://www.youtube.com/watch?v=IE0d6xLSEvI'
WHERE name = '루이드';

-- 2. 박준호 참가자 수정 (새로운 YouTube 영상으로 변경)
UPDATE contestants 
SET 
  youtube_id = '3JWTaaS7LdU',
  youtube_url = 'https://www.youtube.com/watch?v=3JWTaaS7LdU'
WHERE name = '박준호';

-- 3. 수정된 데이터 확인
SELECT name, youtube_url, youtube_id, views, likes 
FROM contestants 
WHERE name IN ('루이드', '박준호')
ORDER BY name;
