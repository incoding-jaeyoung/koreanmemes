'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  Calendar,
  Clock,
  Share2,
  Loader2,
  AlertCircle,
  Edit3,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { CommentSection } from '@/components/CommentSection'
import { useAuth } from '@/lib/auth'

interface Post {
  id: string
  title: string
  koreanTitle?: string
  content: string
  koreanContent?: string
  extractedComments?: string[]
  translatedComments?: string[]
  category: string
  imageUrl?: string
  additionalImages?: string[]
  likes: number
  views: number
  createdAt: string
  updatedAt: string
}

function PostDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewIncremented, setViewIncremented] = useState(false)
  const [hasSecretAccess, setHasSecretAccess] = useState(false)

  const postId = params?.id as string

  const categories = [
    { id: 'HUMOR', name: 'K-Humor', emoji: '😂' },
    { id: 'CULTURE', name: 'K-Culture', emoji: '🏮' },
    { id: 'DRAMA', name: 'K-Drama', emoji: '📺' },
    { id: 'LIFESTYLE', name: 'K-Lifestyle', emoji: '🌸' },
    { id: 'TECH', name: 'K-Tech', emoji: '💻' },
    { id: 'GENERAL', name: 'General', emoji: '💬' },
  ]

  // 비밀 액세스 키 확인
  useEffect(() => {
    const accessKey = searchParams.get('access')
    const secretKey = 'korean-memes-secret-2024'
    
    if (accessKey === secretKey) {
      setHasSecretAccess(true)
    } else {
      setHasSecretAccess(false)
    }
  }, [searchParams])

  // 수정/삭제 권한 확인 - 로딩 중이 아닐 때만 권한 허용
  const hasEditPermission = !isLoading && (isAuthenticated || hasSecretAccess)

  // 클라이언트 사이드 메타데이터 업데이트
  useEffect(() => {
    if (!post) return

    const categoryInfo = getCategoryInfo(post.category)
    const description = post.content ? 
      `${post.content.substring(0, 160)}...` : 
      `Korean ${categoryInfo.name.toLowerCase()} content: ${post.title}. ${post.koreanTitle ? `Original: ${post.koreanTitle}` : ''}`

    // 페이지 제목 업데이트
    document.title = `${post.title} - ${categoryInfo.name} | Korean Memes Hub`
    
    // 메타 태그 업데이트
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) || 
                 document.querySelector(`meta[property="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // 기본 메타 태그
    updateMeta('description', description)
    updateMeta('keywords', ['Korean memes', 'Korean culture', categoryInfo.name, 'Korean humor', 'K-culture'].join(', '))
    
    // Open Graph 태그
    updateMeta('og:title', post.title)
    updateMeta('og:description', description)
    updateMeta('og:image', post.imageUrl || '/og-post-default.jpg')
    updateMeta('og:url', `http://localhost:3000/post/${post.id}`)
    updateMeta('og:type', 'article')
    
    // Twitter 카드
    updateMeta('twitter:title', post.title)
    updateMeta('twitter:description', description)
    updateMeta('twitter:image', post.imageUrl || '/twitter-post-default.jpg')
    updateMeta('twitter:card', 'summary_large_image')

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `http://localhost:3000/post/${post.id}`)

  }, [post])

  useEffect(() => {
    if (!postId) return

    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/posts/${postId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch post')
        }

        const data = await response.json()
        setPost(data.post)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError(err instanceof Error ? err.message : 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  // 조회수 증가 (한 번만 실행)
  useEffect(() => {
    if (!postId || viewIncremented) return

    const incrementView = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/view`, {
          method: 'POST'
        })
        
        if (response.ok) {
          const data = await response.json()
          // 로컬 상태의 조회수 업데이트
          setPost(prev => prev ? { ...prev, views: data.views } : null)
          setViewIncremented(true)
        }
      } catch (error) {
        console.error('Failed to increment view:', error)
      }
    }

    // post가 로드된 후에만 조회수 증가
    if (post && !loading) {
      incrementView()
    }
  }, [postId, viewIncremented, post?.id, loading])

  const handleDelete = async () => {
    if (!post) return

    const confirmed = window.confirm('정말로 이 게시글을 삭제하시겠습니까?')
    if (!confirmed) return

    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete post')
      }

      // 삭제 성공 시 홈으로 리디렉션
      router.push('/')
    } catch (error) {
      console.error('Delete error:', error)
      alert('게시글 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1]
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading post...</span>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error || 'Post not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The post you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const categoryInfo = getCategoryInfo(post.category)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </Link>
        
        {/* 권한이 있는 경우에만 수정/삭제 버튼 표시 */}
        {hasEditPermission && (
          <div className="flex items-center gap-3">
            <Link
              href={`/edit/${post.id}${hasSecretAccess ? '?access=korean-memes-secret-2024' : ''}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              수정
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <article className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {categoryInfo.emoji} {categoryInfo.name}
            </span>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(post.createdAt)}
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>
          
          {post.koreanTitle && (
            <p className="text-sm text-gray-600 mb-4">
              Original: {post.koreanTitle}
            </p>
          )}

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.views} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{post.likes} likes</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Updated {formatDate(post.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Featured Images */}
        {(post.imageUrl || (post.additionalImages && post.additionalImages.length > 0)) && (
          <div className="overflow-hidden">
            {/* 다중 이미지가 있는 경우 */}
            {post.additionalImages && post.additionalImages.length > 0 ? (
              <div className="space-y-4 p-6">
                {/* 첫 번째 이미지 (대표 이미지) */}
                {post.imageUrl && (
                  <div className="w-full">
                    <img 
                      src={post.imageUrl} 
                      alt={`${post.title} - 1`}
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* 추가 이미지들을 세로로 배치 */}
                <div className="space-y-4">
                  {post.additionalImages.map((imageUrl, index) => (
                    <div key={index} className="w-full">
                      <img 
                        src={imageUrl} 
                        alt={`${post.title} - ${index + 2}`}
                        className="w-full h-auto object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 단일 이미지인 경우 */
              post.imageUrl && (
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              )
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="prose max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
              {post.content}
            </div>
          </div>
          
          {post.koreanContent && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                🇰🇷 Korean Original
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.koreanContent}
              </div>
            </div>
          )}

          {/* Best Comments from Korean Community */}
          {post.translatedComments && post.translatedComments.length > 0 && (
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                💬 Best Comments from Korean Community
              </h3>
              <div className="flex flex-col gap-2">
                {post.translatedComments.map((translatedComment, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 leading-relaxed text-sm">
                          {translatedComment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-4 italic">
                * Comments from Korean community sites, automatically translated to English
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart className="h-4 w-4" />
                Like ({post.likes})
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
            
            <Link 
              href="/"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              More Posts
            </Link>
          </div>
        </div>
      </article>
      
      {/* 댓글 섹션 */}
      <CommentSection postId={post.id} />
    </div>
  )
}

export default function PostDetailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <PostDetailContent />
    </Suspense>
  )
} 