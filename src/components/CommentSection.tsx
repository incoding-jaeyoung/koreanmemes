"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Pencil, Trash2, Send } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchComments();
    getCurrentUser();
  }, [postId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?post_id=${postId}`);
      const data = await response.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          content: newComment,
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      } else {
        const data = await response.json();
        alert(data.error || '댓글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditContent('');
        fetchComments();
      } else {
        const data = await response.json();
        alert(data.error || '댓글 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
      alert('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComments();
      } else {
        const data = await response.json();
        alert(data.error || '댓글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <section className="space-y-6">
      <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-brand-yellow" />
        COMMENTS <span className="text-brand-yellow">{comments.length}</span>
      </h3>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-brand-yellow" />
                  </div>
                  <div>
                    <button
                      onClick={() => window.location.href = `/profile/${comment.author_name}`}
                      className="text-sm font-bold text-white hover:text-brand-yellow transition-colors cursor-pointer"
                    >
                      {comment.author_name}
                    </button>
                    <p className="text-sm text-neutral-500">
                      {new Date(comment.created_at).toLocaleString()}
                      {comment.updated_at !== comment.created_at && ' (수정됨)'}
                    </p>
                  </div>
                </div>

                {currentUserId === comment.author_id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-neutral-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-brand-red" />
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-brand-yellow/50 transition-colors resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleEdit(comment.id)}
                      className="px-4 py-2 bg-brand-yellow text-black text-sm font-bold rounded-lg hover:scale-105 transition-transform"
                    >
                      수정 완료
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-neutral-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
            <p className="italic">첫 댓글을 작성해보세요!</p>
          </div>
        )}
      </div>

      {/* 댓글 작성 폼 또는 로그인 안내 */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="glass-card p-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 focus:outline-none focus:border-brand-yellow/50 transition-colors resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-6 py-2.5 bg-brand-yellow text-black font-bold italic rounded-lg hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="w-4 h-4" />
              댓글 작성
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-neutral-400 font-bold italic">댓글을 달려면 로그인이 필요합니다.</p>
          <button
            onClick={() => {
              const currentPath = window.location.pathname;
              window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
            }}
            className="px-8 py-2.5 bg-brand-yellow text-black font-bold italic rounded-lg hover:scale-105 transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,183,0,0.3)]"
          >
            로그인하기
          </button>
        </div>
      )}
    </section>
  );
}
