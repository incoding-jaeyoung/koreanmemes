-- 아키라 유키(Akira Yuki) 캐릭터 게시판의 모든 게시글을 삭제하는 SQL입니다.
-- character_id는 'akira'입니다. (akira-yuki의 앞부분)

DELETE FROM posts 
WHERE character_id = 'akira';

-- 삭제된 게시글 수 확인 (선택사항)
-- SELECT count(*) FROM posts WHERE character_id = 'akira';
