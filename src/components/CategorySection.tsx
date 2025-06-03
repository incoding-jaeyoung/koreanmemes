'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Heart, 
  Eye, 
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  koreanTitle?: string
  content: string
  category: string
  imageUrl?: string
  likes: number
  views: number
  commentCount: number
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function CategorySection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })

  const postsPerPage = 15 // 테스트용으로 5개 (나중에 30개로 변경)

  const categories = [
    { id: 'ALL', name: 'All Posts', emoji: '🌐' },
    { id: 'HUMOR', name: 'K-Humor', emoji: '😂' },
    { id: 'CULTURE', name: 'K-Culture', emoji: '🏮' },
    { id: 'DRAMA', name: 'K-Drama', emoji: '📺' },
    { id: 'LIFESTYLE', name: 'K-Lifestyle', emoji: '🌸' },
    { id: 'TECH', name: 'K-Tech', emoji: '💻' },
    { id: 'GENERAL', name: 'General', emoji: '💬' },
  ]

  const fetchPosts = async (category?: string, page = 1) => {
    try {
      setLoading(true)
      const offset = (page - 1) * postsPerPage
      const url = category && category !== 'ALL' 
        ? `/api/posts?category=${category}&limit=${postsPerPage}&offset=${offset}`
        : `/api/posts?limit=${postsPerPage}&offset=${offset}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      setPosts(data.posts || [])
      setPaginationInfo({
        totalCount: data.totalCount || 0,
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        hasNextPage: data.hasNextPage || false,
        hasPrevPage: data.hasPrevPage || false
      })
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setPosts([])
      setPaginationInfo({
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      })
    } finally {
      setLoading(false)
    }
  }

  // 카테고리가 변경될 때 첫 페이지로 리셋
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    fetchPosts(selectedCategory, currentPage)
  }, [selectedCategory, currentPage])

  // 디버깅용 - 페이징 정보 출력
  useEffect(() => {
    console.log('=== 페이징 디버깅 ===')
    console.log('Posts length:', posts.length)
    console.log('Total count:', paginationInfo.totalCount)
    console.log('Total pages:', paginationInfo.totalPages)
    console.log('Current page:', paginationInfo.currentPage)
    console.log('postsPerPage:', postsPerPage)
    console.log('Will show pagination?', paginationInfo.totalPages > 1)
    console.log('===================')
  }, [posts, paginationInfo, postsPerPage])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // 페이지 번호 배열 생성 (현재 페이지 주변 페이지들만 표시)
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 10 // 최대 10개 페이지 번호 표시
    
    // 페이지가 적으면 모든 페이지 표시
    if (paginationInfo.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= paginationInfo.totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 페이지가 많으면 현재 페이지 중심으로 표시
      const halfPages = Math.floor(maxPagesToShow / 2)
      let startPage = Math.max(1, currentPage - halfPages)
      let endPage = Math.min(paginationInfo.totalPages, currentPage + halfPages)
      
      // 시작이나 끝에서 조정
      if (endPage - startPage < maxPagesToShow - 1) {
        if (startPage === 1) {
          endPage = Math.min(paginationInfo.totalPages, startPage + maxPagesToShow - 1)
        } else {
          startPage = Math.max(1, endPage - maxPagesToShow + 1)
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  return (
    <>
      {/* Category Filter */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{category.emoji}</span>
              <span className="font-medium text-sm">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Posts Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            {selectedCategory === 'ALL' ? 'Latest Posts' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <div className="text-sm text-gray-500">
            {paginationInfo.totalCount} posts total
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading posts...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share Korean culture with the world!</p>
            <Link 
              href="/write"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Write First Post
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="block">
                  <article className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                    {post.imageUrl && (
                      <div className="aspect-video overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center relative">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="absolute inset-0 w-full object-cover hover:scale-105 transition-transform duration-300"
                          style={{transformOrigin: 'top', objectFit: 'cover', objectPosition: 'top' }}
                          onLoad={() => console.log('Image loaded:', post.imageUrl)}
                          onError={(e) => console.error('Image failed to load:', post.imageUrl, e)}
                        />
                      </div>
                    )}
                    
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                          {categories.find(c => c.id === post.category)?.name || post.category}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight line-clamp-2 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      {post.koreanTitle && (
                        <p className="text-sm text-gray-600 mb-2">
                          Original: {post.koreanTitle}
                        </p>
                      )}
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {truncateContent(post.content)}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{post.commentCount || 0}</span>
                          </div>
                        </div>
                        
                        <div className="text-gray-500 text-xs">
                          Updated {formatDate(post.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination - 임시로 항상 표시 */}
            {paginationInfo.totalCount > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {/* 이전 페이지 버튼 */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationInfo.hasPrevPage}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>

                {/* 페이지 번호들 */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* 다음 페이지 버튼 */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationInfo.hasNextPage}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* 페이지 정보 표시 */}
            <div className="text-center text-sm text-gray-500 mt-4">
              page {paginationInfo.currentPage} / {paginationInfo.totalPages} 
              ({((currentPage - 1) * postsPerPage + 1)} - {Math.min(currentPage * postsPerPage, paginationInfo.totalCount)} of {paginationInfo.totalCount} posts)
            </div>
          </>
        )}
      </section>
    </>
  )
} 