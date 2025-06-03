'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ImageIcon, 
  Type, 
  Globe,
  Save,
  Eye,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ImageUpload'
import { MultipleImageUpload } from '@/components/MultipleImageUpload'
import { SEOHead } from '@/components/SEOHead'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function WritePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [koreanTitle, setKoreanTitle] = useState('')
  const [content, setContent] = useState('')
  const [koreanContent, setKoreanContent] = useState('')
  const [category, setCategory] = useState('HUMOR')
  const [imageUrl, setImageUrl] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [multipleImagesMode, setMultipleImagesMode] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTranslatingTitle, setIsTranslatingTitle] = useState(false)
  const [isTranslatingContent, setIsTranslatingContent] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [manualComments, setManualComments] = useState<string[]>([''])
  const [translatedComments, setTranslatedComments] = useState<string[]>([''])
  const [isTranslatingComments, setIsTranslatingComments] = useState<boolean[]>([])
  
  const categories = [
    { value: 'HUMOR', label: 'K-Humor 😂', description: 'Korean humor, memes, funny content' },
    { value: 'CULTURE', label: 'K-Culture 🏮', description: 'Korean culture, traditions, customs' },
    { value: 'DRAMA', label: 'K-Drama 📺', description: 'K-Drama, entertainment, celebrities' },
    { value: 'LIFESTYLE', label: 'K-Lifestyle 🌸', description: 'Korean daily life, lifestyle' },
    { value: 'TECH', label: 'K-Tech 💻', description: 'Korean IT, startups, technology' },
    { value: 'GENERAL', label: 'General 💬', description: 'Other Korean-related topics' },
  ]

  // 컴포넌트 마운트 시 초기화 완료 표시
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // 한글 타이틀 자동 번역
  useEffect(() => {
    const translateKoreanTitle = async () => {
      if (!koreanTitle.trim()) {
        setTitle('')
        return
      }

      // 한글이 포함되어 있는지 확인
      const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
      if (!koreanRegex.test(koreanTitle)) {
        return
      }

      setIsTranslatingTitle(true)
      
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: koreanTitle
          })
        })

        const result = await response.json()
        
        if (result.success && result.translatedText) {
          setTitle(result.translatedText)
        }
      } catch (error) {
        console.error('Title translation error:', error)
      } finally {
        setIsTranslatingTitle(false)
      }
    }

    // 디바운스: 1초 후에 번역 실행
    const timeoutId = setTimeout(translateKoreanTitle, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [koreanTitle])

  // 한글 콘텐츠 자동 번역
  useEffect(() => {
    const translateKoreanContent = async () => {
      if (!koreanContent.trim()) {
        setContent('')
        return
      }

      // 한글이 포함되어 있는지 확인
      const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
      if (!koreanRegex.test(koreanContent)) {
        return
      }

      setIsTranslatingContent(true)
      
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: koreanContent
          })
        })

        const result = await response.json()
        
        if (result.success && result.translatedText) {
          setContent(result.translatedText)
        }
      } catch (error) {
        console.error('Content translation error:', error)
      } finally {
        setIsTranslatingContent(false)
      }
    }

    // 디바운스: 1초 후에 번역 실행
    const timeoutId = setTimeout(translateKoreanContent, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [koreanContent])

  // 댓글 번역 함수
  const translateComment = async (commentText: string, index: number) => {
    if (!commentText.trim()) {
      const newTranslated = [...translatedComments]
      newTranslated[index] = ''
      setTranslatedComments(newTranslated)
      return
    }

    // 한글이 포함되어 있는지 확인
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
    if (!koreanRegex.test(commentText)) {
      return
    }

    // 이미 번역 중인지 확인
    if (isTranslatingComments[index]) {
      return
    }

    const newTranslating = [...isTranslatingComments]
    newTranslating[index] = true
    setIsTranslatingComments(newTranslating)
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: commentText
        })
      })

      const result = await response.json()
      
      if (result.success && result.translatedText) {
        const newTranslated = [...translatedComments]
        newTranslated[index] = result.translatedText
        setTranslatedComments(newTranslated)
      }
    } catch (error) {
      console.error('Comment translation error:', error)
    } finally {
      const newTranslating = [...isTranslatingComments]
      newTranslating[index] = false
      setIsTranslatingComments(newTranslating)
    }
  }

  // 댓글 업데이트 시 번역도 함께 처리
  const updateComment = (index: number, value: string) => {
    const newComments = [...manualComments]
    newComments[index] = value
    setManualComments(newComments)

    // 1초 후에 번역 실행 (디바운싱)
    setTimeout(() => {
      translateComment(value, index)
    }, 1000)
  }

  // 댓글 추가 시 번역 배열도 확장
  const addComment = () => {
    setManualComments([...manualComments, ''])
    setTranslatedComments([...translatedComments, ''])
  }

  // 댓글 제거 시 번역 배열도 축소
  const removeComment = (index: number) => {
    const newComments = manualComments.filter((_, i) => i !== index)
    const newTranslated = translatedComments.filter((_, i) => i !== index)
    setManualComments(newComments.length === 0 ? [''] : newComments)
    setTranslatedComments(newTranslated.length === 0 ? [''] : newTranslated)
  }

  // 일괄 댓글 입력 시 번역도 함께 처리
  const handleBulkComments = async (text: string) => {
    const parsedComments = parseCommentsText(text)
    if (parsedComments.length > 0) {
      setManualComments(parsedComments)
      
      // 번역 배열 초기화
      const initialTranslated = new Array(parsedComments.length).fill('')
      setTranslatedComments(initialTranslated)
      
      // 각 댓글을 순차적으로 번역 (Promise.all 사용으로 병렬 처리)
      const translationPromises = parsedComments.map(async (comment, index) => {
        if (!comment.trim()) return ''
        
        const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
        if (!koreanRegex.test(comment)) return ''

        try {
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: comment
            })
          })

          const result = await response.json()
          return result.success && result.translatedText ? result.translatedText : ''
        } catch (error) {
          console.error(`Comment ${index + 1} translation error:`, error)
          return ''
        }
      })

      // 모든 번역이 완료된 후 상태 업데이트
      const translatedResults = await Promise.all(translationPromises)
      setTranslatedComments(translatedResults)
    }
  }

  // 최종 댓글 리스트 (한글 원본)
  const finalComments = manualComments.filter(comment => comment.trim().length > 0)
  // 최종 번역 댓글 리스트 (영문)
  const finalTranslatedComments = translatedComments.filter((comment, index) => 
    manualComments[index]?.trim().length > 0 && comment.trim().length > 0
  )

  // 댓글 텍스트 파싱 함수
  const parseCommentsText = (text: string): string[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line)
    const comments: string[] = []
    
    console.log('=== 댓글 파싱 시작 ===')
    console.log('총 라인 수:', lines.length)
    console.log('처음 5줄:', lines.slice(0, 5))
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      console.log(`[${i}] 분석 중:`, line.substring(0, 50))
      
      // 방법 1: 베스트 댓글 패턴
      if (line.includes('베스트') && line.includes('\t')) {
        // 현재 줄에서 댓글 내용 추출 시도
        const parts = line.split('\t')
        if (parts.length > 1) {
          const bestCommentText = parts[parts.length - 1].replace(/\[\d+\]/g, '').trim()
          if (bestCommentText && bestCommentText.length > 5 && !/^\d+\s*\d*$/.test(bestCommentText)) {
            console.log(`베스트 댓글 발견 (현재 줄):`, bestCommentText)
            comments.push(bestCommentText)
            continue
          }
        }
        
        // 다음 줄에서 댓글 내용 찾기
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1]
          const bestNextCommentText = nextLine.replace(/\[\d+\]/g, '').trim()
          
          if (bestNextCommentText && bestNextCommentText.length > 5 && 
              !bestNextCommentText.includes('추천') && !bestNextCommentText.includes('반대') &&
              !/^\d+\s*\d*$/.test(bestNextCommentText)) {
            console.log(`베스트 댓글 발견 (다음 줄):`, bestNextCommentText)
            comments.push(bestNextCommentText)
            i++ // 다음 줄을 건너뛰기
            continue
          }
        }
      }
      
      // 방법 2: 탭 구분 일반 댓글 패턴
      if (line.includes('\t')) {
        const parts = line.split('\t')
        if (parts.length >= 2) {
          // 현재 줄에서 댓글 내용 추출 시도
          const generalCommentText = parts[parts.length - 1].trim()
          if (generalCommentText && generalCommentText.length > 5 &&
              !generalCommentText.includes('추천') && !generalCommentText.includes('반대') &&
              !generalCommentText.includes('이동') && !generalCommentText.includes('답글') &&
              !/^\d+\s*\d*$/.test(generalCommentText)) {
            console.log(`일반 댓글 발견 (현재 줄):`, generalCommentText)
            comments.push(generalCommentText)
            continue
          }
          
          // 다음 줄에서 댓글 내용 찾기
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1]
            const generalNextCommentText = nextLine.trim()
            
            if (generalNextCommentText && generalNextCommentText.length > 5 &&
                !generalNextCommentText.includes('추천') && !generalNextCommentText.includes('반대') &&
                !generalNextCommentText.includes('이동') && !generalNextCommentText.includes('답글') &&
                !/^\d+\s*\d*$/.test(generalNextCommentText)) {
              console.log(`일반 댓글 발견 (다음 줄):`, generalNextCommentText)
              comments.push(generalNextCommentText)
              i++ // 다음 줄을 건너뛰기
              continue
            }
          }
        }
      }
      
      // 방법 3: 직접 댓글 패턴 (한글 + 감정표현)
      if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(line) && 
          /[ㅋㅎㅠㅜㄷ;;!?]/.test(line) &&
          !line.includes('로그인') && !line.includes('회원가입') &&
          !line.includes('메뉴') && !line.includes('검색') &&
          !line.includes('추천') && !line.includes('반대') &&
          line.length >= 5 && line.length <= 200) {
        console.log(`직접 댓글 패턴 발견:`, line)
        comments.push(line)
      }
    }
    
    console.log('=== 파싱 결과 ===')
    console.log('추출된 댓글 수:', comments.length)
    console.log('댓글 목록:', comments)
    
    // 중복 제거 및 최대 10개 제한
    const uniqueComments = [...new Set(comments)].slice(0, 10)
    console.log('최종 댓글 수:', uniqueComments.length)
    
    return uniqueComments
  }

  // 이미지 URL 변경 핸들러 메모이제이션
  const handleImageUrlsChange = useCallback((urls: string[]) => {
    console.log('=== handleImageUrlsChange 호출 ===')
    console.log('받은 URLs:', urls)
    console.log('isInitialized:', isInitialized)
    // 초기화 조건 제거 - 항상 상태 업데이트
    console.log('imageUrls 상태 업데이트:', urls)
    setImageUrls(urls)
  }, [])

  // imageUrls 상태 변화 추적
  useEffect(() => {
    console.log('=== imageUrls 상태 변화 ===')
    console.log('현재 imageUrls:', imageUrls)
    console.log('multipleImagesMode:', multipleImagesMode)
  }, [imageUrls, multipleImagesMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 번역된 이미지 자동 처리 - ImageTranslator에서 번역 완료된 이미지가 있는지 확인
      const finalImageUrl = multipleImagesMode 
        ? (imageUrls.length > 0 ? imageUrls[0] : '') 
        : imageUrl
      
      // MultipleImageUpload의 경우 번역된 이미지들 자동 포함
      const finalAdditionalImages = multipleImagesMode ? imageUrls.slice(1) : []

      // 디버깅 로그 추가
      console.log('=== 게시글 작성 디버깅 정보 ===')
      console.log('multipleImagesMode:', multipleImagesMode)
      console.log('imageUrls:', imageUrls)
      console.log('imageUrl:', imageUrl)
      console.log('finalImageUrl:', finalImageUrl)
      console.log('finalAdditionalImages:', finalAdditionalImages)

      const requestData = {
        title,
        koreanTitle,
        content,
        koreanContent,
        category,
        imageUrl: finalImageUrl,
        additionalImages: finalAdditionalImages, // 번역된 이미지들 포함
        extractedComments: finalComments.length > 0 ? finalComments : null, // 한글 원본 댓글들
        translatedComments: finalTranslatedComments.length > 0 ? finalTranslatedComments : null, // 영문 번역 댓글들
      }

      console.log('Request data:', JSON.stringify(requestData, null, 2))

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }

      const result = await response.json()
      console.log('Post created successfully:', result)
      
      // 성공 시 홈페이지로 리다이렉트
      router.push('/')
      
    } catch (error) {
      console.error('Post creation error:', error)
      alert(`게시글 작성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUploaded = (url: string) => {
    setImageUrl(url)
  }

  const handleRemoveImage = () => {
    setImageUrl('')
  }

  return (
    <ProtectedRoute>
      <SEOHead
        title="Share Korean Culture - Write New Post"
        description="Share Korean memes, culture, humor, and insights with the global community. Create posts with Korean original content and English translations."
        canonical="http://localhost:3000/write"
        keywords={[
          'write Korean content',
          'share Korean memes',
          'Korean culture submission',
          'K-culture community',
          'Korean humor posting',
          'Korean content creation'
        ]}
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Write New Post</h1>
              <p className="text-gray-600">Share Korean culture with the world</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              {isPreview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        {!isPreview ? (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Category
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <label key={cat.value} className="relative">
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={(e) => setCategory(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      category === cat.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="font-medium text-gray-900">{cat.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{cat.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Title - 순서 변경: Korean Title이 위로 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Type className="h-4 w-4" />
                    Korean Original Title
                  </label>
                  <input
                    type="text"
                    value={koreanTitle}
                    onChange={(e) => setKoreanTitle(e.target.value)}
                    placeholder="e.g., Korean Workplace Culture: The Mysterious World of 'Nunchi'"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Globe className="h-4 w-4" />
                    English Title
                    {isTranslatingTitle && (
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Translating...
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Korean Office Culture: The Mystery of 'Nunchi' Explained"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    English title will be automatically translated when you type Korean title
                  </p>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ImageIcon className="h-4 w-4" />
                  Featured Images (Optional)
                </label>
                
                {/* 단일/다중 이미지 모드 선택 */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Mode:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageMode"
                      checked={!multipleImagesMode}
                      onChange={() => setMultipleImagesMode(false)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Single</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageMode"
                      checked={multipleImagesMode}
                      onChange={() => setMultipleImagesMode(true)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Multiple</span>
                  </label>
                </div>
              </div>

              {multipleImagesMode ? (
                <MultipleImageUpload
                  onImagesChange={handleImageUrlsChange}
                  currentImages={imageUrls}
                  maxImages={5}
                />
              ) : (
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  currentImage={imageUrl}
                  onRemoveImage={handleRemoveImage}
                />
              )}
            </div>

            {/* Content - required 제거 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Type className="h-4 w-4" />
                    Korean Original Content (Optional)
                  </label>
                  <textarea
                    value={koreanContent}
                    onChange={(e) => setKoreanContent(e.target.value)}
                    placeholder="Enter original content about Korean culture or humor..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Globe className="h-4 w-4" />
                    English Translation Content (Optional)
                    {isTranslatingContent && (
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Translating...
                      </span>
                    )}
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Translate and explain Korean culture or humor in English..."
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    English content will be automatically translated when you type Korean content
                  </p>
                </div>
              </div>
            </div>

            {/* Best Comments Section - 수동 입력 방식으로 변경 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Globe className="h-4 w-4" />
                    Korean Community Comments (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Add best comments from Korean community sites manually
                  </p>
                  
                  {/* 일괄 입력 기능 */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      💡 Quick Input: Paste copied comment text
                    </h5>
                    <textarea
                      placeholder="Paste comment text copied from Korean community sites here..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      onPaste={(e) => {
                        e.preventDefault()
                        const text = e.clipboardData.getData('text')
                        handleBulkComments(text)
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only comment content will be automatically extracted when pasted
                    </p>
                  </div>
                </div>
                
                {manualComments.map((comment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">
                              Korean Original
                              {isTranslatingComments[index] && (
                                <span className="ml-2 text-blue-600 flex items-center gap-1 inline-flex">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Translating...
                                </span>
                              )}
                            </label>
                            <textarea
                              value={comment}
                              onChange={(e) => updateComment(index, e.target.value)}
                              placeholder={`Enter comment ${index + 1}...`}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                          </div>
                          
                          {translatedComments[index] && (
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">
                                English Translation
                              </label>
                              <div className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                                {translatedComments[index]}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {index === manualComments.length - 1 && (
                          <button
                            type="button"
                            onClick={addComment}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            +
                          </button>
                        )}
                        {manualComments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeComment(index)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {finalComments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Preview ({finalComments.length} comments)
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {finalComments.map((comment, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs text-blue-600 font-medium">Korean:</span>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {comment}
                              </p>
                            </div>
                            {finalTranslatedComments[index] && (
                              <div>
                                <span className="text-xs text-green-600 font-medium">English:</span>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {finalTranslatedComments[index]}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      ✓ These comments will be displayed at the bottom of your post in both languages
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !koreanTitle.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Publish Post
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Preview Mode */
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="max-w-3xl mx-auto">
              {/* Preview Header */}
              <div className="mb-6">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find(cat => cat.value === category)?.label}
                </span>
              </div>

              {/* Preview Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {title || 'Your English Title'}
              </h1>
              {koreanTitle && (
                <p className="text-gray-600 italic mb-6">
                  {koreanTitle}
                </p>
              )}

              {/* Preview Images */}
              {(multipleImagesMode ? imageUrls.length > 0 : imageUrl) && (
                <div className="mb-6">
                  {multipleImagesMode ? (
                    <div className="space-y-4">
                      {imageUrls.map((url, index) => (
                        <img 
                          key={index}
                          src={url} 
                          alt={`Image ${index + 1}`} 
                          className="w-full rounded-lg"
                        />
                      ))}
                    </div>
                  ) : (
                    <img 
                      src={imageUrl} 
                      alt="Featured" 
                      className="w-full max-w-2xl mx-auto rounded-lg"
                    />
                  )}
                </div>
              )}

              {/* Preview Content */}
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {content || 'Your English content will appear here...'}
                </div>
                
                {koreanContent && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Korean Original</h3>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {koreanContent}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
} 