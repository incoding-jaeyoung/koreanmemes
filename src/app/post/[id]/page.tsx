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
  Trash2,
  ChevronLeft,
  ChevronRight,
  List
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

interface PostNavigation {
  prev?: {
    id: string
    title: string
  }
  next?: {
    id: string
    title: string
  }
}

function PostDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [navigation, setNavigation] = useState<PostNavigation>({})
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
    updateMeta('og:url', `https://www.koreanmemes.net/post/${post.id}`)
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
    canonical.setAttribute('href', `https://www.koreanmemes.net/post/${post.id}`)

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
        setNavigation(data.navigation || {})
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
      <div className="max-w-4xl px-4 py-8 mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading post...</span>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl px-4 py-8 mx-auto">
        <div className="py-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            {error || 'Post not found'}
          </h2>
          <p className="mb-6 text-gray-600">
            The post you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const categoryInfo = getCategoryInfo(post.category)

  return (
    <div className="max-w-4xl px-4 py-8 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/"
          className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
        
        {/* 권한이 있는 경우에만 수정/삭제 버튼 표시 */}
        {hasEditPermission && (
          <div className="flex items-center gap-3">
            <Link
              href={`/edit/${post.id}${hasSecretAccess ? '?access=korean-memes-secret-2024' : ''}`}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Edit3 className="w-4 h-4" />
              수정
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <article className="overflow-hidden bg-white border rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
              {categoryInfo.emoji} {categoryInfo.name}
            </span>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(post.createdAt)}
            </div>
          </div>

          <h1 className="mb-4 text-xl font-bold leading-tight text-gray-900 md:text-2xl">
            {post.title}
          </h1>
          
          {post.koreanTitle && (
            <p className="mb-4 text-sm text-gray-600">
              Original: {post.koreanTitle}
            </p>
          )}

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.views} views</span>
            </div>
            {/* <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{post.likes} likes</span>
            </div> */}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Updated {formatDate(post.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Featured Images */}
        {(post.imageUrl || (post.additionalImages && post.additionalImages.length > 0)) && (
          <div className="overflow-hidden">
            {/* 다중 이미지가 있는 경우 */}
            {post.additionalImages && post.additionalImages.length > 0 ? (
              <div className="p-6 space-y-4">
                {/* 첫 번째 이미지 (대표 이미지) */}
                {post.imageUrl && (
                  <div className="w-full">
                    <img 
                      src={post.imageUrl} 
                      alt={`${post.title} - 1`}
                      className="object-cover w-full h-auto rounded-lg"
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
                        className="object-cover w-full h-auto rounded-lg"
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
                  className="object-cover w-full h-full"
                />
              )
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="prose max-w-none">
            <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
          
          {post.koreanContent && (
            <div className="p-6 mt-8 rounded-lg bg-gray-50">
              <h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-gray-900">
                🇰🇷 Korean Original
              </h3>
              <div className="leading-relaxed text-gray-700 whitespace-pre-wrap">
                {post.koreanContent}
              </div>
            </div>
          )}

          {/* Best Comments from Korean Community */}
          {post.translatedComments && post.translatedComments.length > 0 && (
            <div className="p-6 mt-8 border border-blue-200 rounded-lg bg-blue-50">
              <h3 className="flex items-center gap-2 mb-4 font-bold text-gray-900 text-md">
                💬 Best Comments from Korean Community
              </h3>
              <div className="flex flex-col gap-2">
                {post.translatedComments.map((translatedComment, index) => (
                  <div key={index} className="p-4 bg-white border border-blue-100 rounded-lg shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full">
                        <span className="text-xs font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed text-gray-800">
                          {translatedComment}
                        </p>
                        {/* 한글 원문 표시 */}
                        {post.extractedComments && post.extractedComments[index] && (
                          <div className="pt-3 mt-3 border-t border-gray-200">
                            <div className="mb-1 text-xs text-gray-500">Korean Original</div>
                            <p className="text-xs leading-relaxed text-gray-600">
                              {post.extractedComments[index]}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs italic text-blue-600">
                * Comments from Korean community sites, automatically translated to English
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Post List 버튼 (왼쪽) */}
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <List className="w-4 h-4" />
              Post List
            </Link>

            {/* 이전/다음 네비게이션 (오른쪽) */}
            <div className="flex items-center gap-2">
              {navigation.prev ? (
                <Link
                  href={`/post/${navigation.prev.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors group"
                  title={navigation.prev.title}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </div>
              )}

              {navigation.next ? (
                <Link
                  href={`/post/${navigation.next.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors group"
                  title={navigation.next.title}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed">
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* 포스트 제목 미리보기 (호버 시 표시) */}
          {(navigation.prev || navigation.next) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500">
                {navigation.prev && (
                  <div className="flex-1 mr-4">
                    <span className="block text-gray-400 mb-1">← Previous</span>
                    <span className="line-clamp-2">{navigation.prev.title}</span>
                  </div>
                )}
                {navigation.next && (
                  <div className="flex-1 ml-4 text-right">
                    <span className="block text-gray-400 mb-1">Next →</span>
                    <span className="line-clamp-2">{navigation.next.title}</span>
                  </div>
                )}
              </div>
            </div>
          )}
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
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="w-3/4 h-8 mb-6 bg-gray-200 rounded"></div>
            <div className="h-64 mb-6 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
              <div className="w-4/5 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <PostDetailContent />
    </Suspense>
  )
} 