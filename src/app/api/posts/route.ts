import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Category } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { title, koreanTitle, content, koreanContent, category, imageUrl, additionalImages, extractedComments, translatedComments } = body

    // 디버깅 로그 추가
    console.log('=== API POST 디버깅 정보 ===')
    console.log('Received body:', JSON.stringify(body, null, 2))
    console.log('additionalImages type:', typeof additionalImages)
    console.log('additionalImages value:', additionalImages)
    console.log('additionalImages length:', additionalImages?.length)
    console.log('extractedComments type:', typeof extractedComments)
    console.log('extractedComments value:', extractedComments)
    console.log('extractedComments length:', extractedComments?.length)
    console.log('translatedComments type:', typeof translatedComments)
    console.log('translatedComments value:', translatedComments)
    console.log('translatedComments length:', translatedComments?.length)

    // 필수 필드 검증
    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    // 카테고리 검증
    if (!Object.values(Category).includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // 게시글 생성
    const post = await prisma.post.create({
      data: {
        title,
        koreanTitle: koreanTitle || null,
        content: content || '',
        koreanContent: koreanContent || null,
        extractedComments: extractedComments && Array.isArray(extractedComments) && extractedComments.length > 0 
          ? JSON.parse(JSON.stringify(extractedComments))
          : undefined,
        translatedComments: translatedComments && Array.isArray(translatedComments) && translatedComments.length > 0 
          ? JSON.parse(JSON.stringify(translatedComments))
          : undefined,
        category: category as Category,
        imageUrl: imageUrl || null,
        additionalImages: additionalImages && Array.isArray(additionalImages) && additionalImages.length > 0 
          ? JSON.parse(JSON.stringify(additionalImages))
          : undefined,
        // MVP 단계에서 임시로 undefined로 설정 (사용자 인증 구현 후 실제 사용자 ID 사용)
        authorId: undefined,
        likes: 0,
        views: 0,
      },
    })

    console.log('New post created:', post.id)

    return NextResponse.json({ 
      success: true, 
      post: {
        id: post.id,
        title: post.title,
        category: post.category
      },
      message: 'Post created successfully' 
    })

  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 카테고리 필터 처리
    const whereCondition = category && Object.values(Category).includes(category as Category) 
      ? { category: category as Category } 
      : undefined

    // 총 게시글 수 조회 (페이지네이션용)
    const totalCount = await prisma.post.count({
      where: whereCondition
    })

    // 게시글 목록 조회
    const posts = await prisma.post.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        koreanTitle: true,
        content: true,
        category: true,
        imageUrl: true,
        additionalImages: true,
        extractedComments: true,
        translatedComments: true,
        likes: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            comments: {
              where: {
                isBlocked: false // 차단되지 않은 댓글만 카운트
              }
            }
          }
        }
      }
    })

    // additionalImages, extractedComments, translatedComments 처리
    const formattedPosts = posts.map(post => ({
      ...post,
      commentCount: post._count.comments, // 댓글 개수 추가
      additionalImages: Array.isArray(post.additionalImages) 
        ? post.additionalImages as string[]
        : [],
      extractedComments: Array.isArray(post.extractedComments) 
        ? post.extractedComments as string[]
        : [],
      translatedComments: Array.isArray(post.translatedComments) 
        ? post.translatedComments as string[]
        : [],
      _count: undefined // _count 제거 (commentCount로 대체)
    }))

    return NextResponse.json({ 
      posts: formattedPosts,
      totalCount,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: offset + limit < totalCount,
      hasPrevPage: offset > 0
    })

  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
} 