'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, User, Edit2, Trash2, X, Check } from 'lucide-react'

interface Comment {
  id: string
  content: string
  nickname?: string
  createdAt: string
  updatedAt?: string
}

interface CommentSectionProps {
  postId: string
}

interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (password: string) => void
  title: string
  placeholder: string
  buttonText: string
  buttonColor: string
}

function ActionModal({ isOpen, onClose, onConfirm, title, placeholder, buttonText, buttonColor }: ActionModalProps) {
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim()) {
      onConfirm(password.trim())
      setPassword('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              placeholder={placeholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              autoComplete="current-password"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${buttonColor}`}
              disabled={!password.trim()}
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function CommentSection({ postId }: CommentSectionProps) {
  console.log('CommentSection 렌더링됨, postId:', postId)
  
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  
  // 수정 관련 상태
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editPassword, setEditPassword] = useState('')
  
  // 삭제 관련 상태
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, commentId: '' })

  const fetchComments = async () => {
    try {
      setFetchLoading(true)
      setFetchError('')
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        console.log('댓글 데이터:', data) // 디버깅용
        setComments(Array.isArray(data) ? data : [])
      } else {
        setFetchError(`Failed to load comments: ${response.status}`)
      }
    } catch (error) {
      console.error('댓글 로딩 실패:', error)
      setFetchError('Error occurred while loading comments.')
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          nickname: nickname.trim() || undefined,
          password: password.trim() || undefined
        })
      })

      if (response.ok) {
        setNewComment('')
        setNickname('')
        setPassword('')
        await fetchComments()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit comment.')
      }
    } catch {
      setError('Error occurred while submitting comment.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
    setEditPassword('')
  }

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim() || !editPassword.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent.trim(),
          password: editPassword.trim()
        })
      })

      if (response.ok) {
        setEditingComment(null)
        setEditContent('')
        setEditPassword('')
        await fetchComments()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update comment.')
      }
    } catch {
      setError('Error occurred while updating comment.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
    setEditPassword('')
  }

  const handleDeleteConfirm = async (password: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${deleteModal.commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        setDeleteModal({ isOpen: false, commentId: '' })
        await fetchComments()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete comment.')
      }
    } catch {
      setError('Error occurred while deleting comment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 border-t pt-8">
      {/* 댓글 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">
          Comments {fetchLoading ? 'Loading...' : fetchError ? 'Load Failed' : `${comments.length}`}
        </h3>
      </div>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Nickname (optional)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            maxLength={50}
          />
          <input
            type="password"
            placeholder="Password (for edit/delete, optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            maxLength={50}
            autoComplete="new-password"
          />
        </div>
        
        <div className="mb-3">
          <textarea
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            rows={3}
            maxLength={1000}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {newComment.length}/1000
          </div>
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!newComment.trim() || loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Submitting...' : 'Post Comment'}
        </button>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {fetchLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading comments... 🔄
          </div>
        ) : fetchError ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">{fetchError}</div>
            <button 
              onClick={fetchComments}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Try Again
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Be the first to comment! 💬
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border rounded-lg p-4">
              {editingComment === comment.id ? (
                // 수정 모드
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="text-right text-sm text-gray-500">
                    {editContent.length}/1000
                  </div>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSubmit(comment.id)}
                      disabled={!editContent.trim() || !editPassword.trim() || loading}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Check className="h-3 w-3" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 표시 모드
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {comment.nickname || 'Anonymous'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                          <span className="text-xs text-gray-400 ml-1">(edited)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(comment)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="댓글 수정"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, commentId: comment.id })}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="댓글 삭제"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <ActionModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, commentId: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Comment"
        placeholder="Enter password"
        buttonText="Delete"
        buttonColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
} 