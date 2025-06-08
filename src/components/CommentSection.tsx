'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, User, Edit2, Trash2, X, Check } from 'lucide-react'

interface Comment {
  id: string
  content: string
  nickname?: string
  createdAt: string
  updatedAt?: string
  translatedContent?: string | null
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

// 한국어 텍스트 감지 함수
function isKoreanText(text: string): boolean {
  const koreanRegex = /[\u3131-\u3163\uac00-\ud7a3]/g
  const koreanMatches = text.match(koreanRegex)
  const koreanCharCount = koreanMatches ? koreanMatches.length : 0
  const totalCharCount = text.replace(/\s/g, '').length // 공백 제외
  
  if (totalCharCount === 0) return false
  
  const koreanPercentage = koreanCharCount / totalCharCount
  return koreanPercentage >= 0.6 // 60% 이상이 한국어이면 한국어 텍스트로 판단
}

function ActionModal({ isOpen, onClose, onConfirm, title, placeholder, buttonText, buttonColor }: ActionModalProps) {
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim() && password.length >= 4) {
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
            {password.length > 0 && password.length < 4 && (
              <div className="text-xs text-red-600 mt-1">
                Password must be at least 4 characters long
              </div>
            )}
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
              disabled={password.length < 4}
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
  if (process.env.NODE_ENV === 'development') {
    console.log('CommentSection 렌더링됨, postId:', postId)
  }
  
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // 수정 관련 상태
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editPassword, setEditPassword] = useState('')
  
  // 삭제 관련 상태
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, commentId: '' })

  // 성공 메시지 표시 및 자동 제거
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const fetchComments = async () => {
    try {
      setFetchLoading(true)
      setFetchError('')
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        if (process.env.NODE_ENV === 'development') {
          console.log('댓글 데이터:', data) // 디버깅용
        }
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
        const newCommentData = await response.json()
        
        // 새 댓글을 즉시 상단에 추가 (최신 순이므로)
        setComments(prevComments => [newCommentData, ...prevComments])
        
        // 폼 초기화
        setNewComment('')
        setNickname('')
        setPassword('')
        
        if (process.env.NODE_ENV === 'development') {
          console.log('댓글이 성공적으로 추가되었습니다:', newCommentData.id)
        }
        
        // 성공 메시지 표시
        showSuccessMessage('댓글이 성공적으로 등록되었습니다! 🎉')
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
        const updatedComment = await response.json()
        
        // 수정된 댓글을 로컬 state에서 업데이트
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, ...updatedComment }
              : comment
          )
        )
        
        setEditingComment(null)
        setEditContent('')
        setEditPassword('')
        
        if (process.env.NODE_ENV === 'development') {
          console.log('댓글이 성공적으로 수정되었습니다:', commentId)
        }
        
        // 성공 메시지 표시
        showSuccessMessage('댓글이 성공적으로 수정되었습니다! ✏️')
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
        // 삭제된 댓글을 로컬 state에서 제거
        setComments(prevComments => 
          prevComments.filter(comment => comment.id !== deleteModal.commentId)
        )
        
        setDeleteModal({ isOpen: false, commentId: '' })
        
        if (process.env.NODE_ENV === 'development') {
          console.log('댓글이 성공적으로 삭제되었습니다:', deleteModal.commentId)
        }
        
        // 성공 메시지 표시
        showSuccessMessage('댓글이 성공적으로 삭제되었습니다! 🗑️')
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

      {/* 성공 메시지 토스트 */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm animate-pulse">
          {successMessage}
        </div>
      )}

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
          <div className="relative">
            <input
              type="password"
              placeholder="Password (4+ characters, required)*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              maxLength={50}
              autoComplete="new-password"
              required
            />
            {password.length > 0 && password.length < 4 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-red-500 text-xs">⚠️</span>
              </div>
            )}
            {password.length >= 4 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-green-500 text-xs">✅</span>
              </div>
            )}
          </div>
        </div>
        
        {/* 비밀번호 길이 안내 */}
        {password.length > 0 && password.length < 4 && (
          <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">
            Password must be at least 4 characters long
          </div>
        )}
        
        <div className="mb-3">
          <textarea
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            rows={3}
            maxLength={1000}
            required
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
          disabled={!newComment.trim() || password.length < 4 || loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Submitting...' : 'Post Comment'}
        </button>
        
        {/* 필수 필드 안내 */}
        <p className="text-xs text-gray-500 mt-2">
          * Password is required for comment editing and deletion
        </p>
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
                    placeholder="Enter password (4+ characters)"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                  />
                  {editPassword.length > 0 && editPassword.length < 4 && (
                    <div className="text-xs text-red-600 mt-1">
                      Password must be at least 4 characters long
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSubmit(comment.id)}
                      disabled={!editContent.trim() || editPassword.length < 4 || loading}
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
                        {comment.nickname === '익명' ? 'Anonymous' : (comment.nickname || 'Anonymous')}
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
                  
                  {/* 번역된 내용 표시 - 통일된 UI */}
                  {comment.translatedContent && isKoreanText(comment.content) && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-medium text-blue-700 mb-2">Translation</div>
                      <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-wrap italic">
                        {comment.translatedContent}
                      </p>
                    </div>
                  )}
                  
                  {/* 영문 댓글의 한글 번역 - 동일한 스타일 */}
                  {comment.translatedContent && !isKoreanText(comment.content) && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-medium text-blue-700 mb-2">Translation</div>
                      <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-wrap italic">
                        {comment.translatedContent}
                      </p>
                    </div>
                  )}
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
        placeholder="Enter password (4+ characters)"
        buttonText="Delete"
        buttonColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
} 