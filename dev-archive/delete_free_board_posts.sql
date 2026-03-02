-- 자유게시판(general)의 모든 게시글을 삭제하는 SQL입니다.
-- Supabase Dashboard > SQL Editor에 복사해서 실행(RUN)하세요.

DELETE FROM posts 
WHERE board_type = 'general';

-- 삭제된 게시글 수 확인 (선택사항)
-- SELECT count(*) FROM posts WHERE board_type = 'general';
