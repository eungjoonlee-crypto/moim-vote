-- 투표 수 DB 연동 수정
-- contestants 테이블에 vote_count 컬럼 추가 및 동기화

-- 1. contestants 테이블에 vote_count 컬럼 추가 (이미 있으면 무시)
ALTER TABLE contestants 
ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;

-- 2. 기존 데이터의 vote_count를 실제 투표 수로 동기화
UPDATE contestants 
SET vote_count = (
    SELECT COUNT(*)::INTEGER 
    FROM votes 
    WHERE votes.contestant_id = contestants.id
);

-- 3. vote_count가 NULL인 경우 0으로 설정
UPDATE contestants 
SET vote_count = 0 
WHERE vote_count IS NULL;

-- 4. vote_count 컬럼을 NOT NULL로 설정
ALTER TABLE contestants 
ALTER COLUMN vote_count SET NOT NULL;

-- 5. 투표가 추가/삭제될 때 자동으로 vote_count 업데이트하는 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_contestant_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    -- INSERT 또는 DELETE 시 해당 참가자의 vote_count 업데이트
    IF TG_OP = 'INSERT' THEN
        UPDATE contestants 
        SET vote_count = (
            SELECT COUNT(*)::INTEGER 
            FROM votes 
            WHERE contestant_id = NEW.contestant_id
        )
        WHERE id = NEW.contestant_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE contestants 
        SET vote_count = (
            SELECT COUNT(*)::INTEGER 
            FROM votes 
            WHERE contestant_id = OLD.contestant_id
        )
        WHERE id = OLD.contestant_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 기존 트리거 제거 (있는 경우)
DROP TRIGGER IF EXISTS votes_update_count ON votes;

-- 7. 새 트리거 생성
CREATE TRIGGER votes_update_count
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_contestant_vote_count();

-- 8. 결과 확인
SELECT 
    c.id,
    c.name, 
    c.song, 
    c.vote_count,
    COUNT(v.id)::INTEGER as actual_votes
FROM contestants c
LEFT JOIN votes v ON v.contestant_id = c.id
GROUP BY c.id, c.name, c.song, c.vote_count
ORDER BY c.created_at;

