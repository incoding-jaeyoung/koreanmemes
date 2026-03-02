-- posts_with_comments 뷰: 소프트 삭제된 댓글 제외하고 카운트
DROP VIEW IF EXISTS posts_with_comments;

CREATE VIEW posts_with_comments AS
SELECT
  p.*,
  COUNT(c.id) FILTER (WHERE c.is_deleted = false) AS comment_count
FROM posts p
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id;
