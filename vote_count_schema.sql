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
