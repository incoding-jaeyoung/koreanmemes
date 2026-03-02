-- 동영상 게시판(Video Board)의 모든 게시글을 삭제하는 SQL입니다.
-- board_type은 'video'입니다.

DELETE FROM posts 
WHERE board_type = 'video';

-- 삭제된 게시글 수 확인 (선택사항)
-- SELECT count(*) FROM posts WHERE board_type = 'video';
