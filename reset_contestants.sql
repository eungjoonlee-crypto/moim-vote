-- 참가자 데이터 초기화 및 새로운 참가자 추가 SQL
-- ⚠️ 주의: 이 스크립트는 기존의 모든 참가자, 투표, 댓글 데이터를 삭제합니다!

-- 1. 기존 데이터 삭제 (순서 중요: 외래 키 제약 조건 때문에 comments, votes를 먼저 삭제)
DELETE FROM comments;
DELETE FROM votes;
DELETE FROM contestants;

-- 2. 시퀀스 초기화 (ID를 1부터 다시 시작)
ALTER SEQUENCE IF EXISTS contestants_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS votes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS comments_id_seq RESTART WITH 1;

-- 3. 새로운 참가자 추가
INSERT INTO contestants (name, song, youtube_url, youtube_id, views, likes, vote_count) VALUES
  ('1호 가수', 'The Door', 'https://youtu.be/sDeVLXh4uc4', 'sDeVLXh4uc4', 0, 0, 0),
  ('2호 가수', 'Start A Fire', 'https://youtu.be/-ynaaTrDZM8', '-ynaaTrDZM8', 0, 0, 0),
  ('3호 가수', '아니라고 말해요(율)', 'https://youtu.be/IChUNQ79wG4', 'IChUNQ79wG4', 0, 0, 0),
  ('4호 가수', 'Music', 'https://youtu.be/j6M6Jfxzr6s', 'j6M6Jfxzr6s', 0, 0, 0),
  ('5호 가수', '심규선', 'https://youtu.be/swqBMZ3FlNg', 'swqBMZ3FlNg', 0, 0, 0),
  ('6호 가수', 'Don''t Rain On My Parade (Glee OST)', 'https://youtu.be/p_oIlBEXTL8', 'p_oIlBEXTL8', 0, 0, 0),
  ('7호 가수', '서울의 달', 'https://youtu.be/Gz6o0a7xfTQ', 'Gz6o0a7xfTQ', 0, 0, 0),
  ('8호 가수', '입술의 말', 'https://youtu.be/RiL464NrDho', 'RiL464NrDho', 0, 0, 0),
  ('9호 가수', 'Billy Joel - New York State of Mind', 'https://youtu.be/OfqvhpHZDsQ', 'OfqvhpHZDsQ', 0, 0, 0),
  ('10호 가수', '정승환 - 눈사람', 'https://youtu.be/UHsN-Gd4K9Q', 'UHsN-Gd4K9Q', 0, 0, 0);

-- 4. 결과 확인
SELECT 
  id,
  name,
  song,
  youtube_url,
  youtube_id,
  views,
  likes,
  vote_count,
  created_at
FROM contestants
ORDER BY id;

-- 5. 추가 확인: 각 테이블의 레코드 수
SELECT 
  (SELECT COUNT(*) FROM contestants) as total_contestants,
  (SELECT COUNT(*) FROM votes) as total_votes,
  (SELECT COUNT(*) FROM comments) as total_comments;

