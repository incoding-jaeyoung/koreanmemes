import { NextRequest, NextResponse } from 'next/server'
import { Category } from '@/generated/prisma'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 환경변수 디버깅 추가
    console.log('=== POST Environment Variables Debug ===')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL value:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    console.log('Prisma client status:', typeof prisma)

    const body = await request.json()
    
    const { title, koreanTitle, content, koreanContent, category, imageUrl, additionalImages, extractedComments, translatedComments } = body

    // 디버깅 로그 추가
    console.log('=== API POST 디버깅 정보 ===')
    console.log('Received body keys:', Object.keys(body))
    console.log('Title:', title)
    console.log('Category:', category)

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
    console.log('=== GET Environment Variables Debug ===')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL value:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    console.log('NODE_ENV:', process.env.NODE_ENV)

    // Prepared statement 충돌 방지를 위해 연결 초기화
    try {
      await prisma.$disconnect()
      await prisma.$connect()
      console.log('✅ Prisma connection refreshed')
    } catch (connError) {
      console.log('⚠️ Connection refresh failed, continuing...', connError)
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // offset이 제공되면 offset을 사용하고, 그렇지 않으면 page를 사용
    const skip = offset > 0 ? offset : (page - 1) * limit
    
    console.log('=== Query Parameters ===')
    console.log('category:', category)
    console.log('skip:', skip, 'limit:', limit)

    // Category enum에 포함된 값인지 확인
    const whereClause = category && category !== 'ALL' && Object.values(Category).includes(category as Category)
      ? { category: category as Category } 
      : {}

    console.log('whereClause:', whereClause)

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where: whereClause })
    ])

    console.log('=== Query Results ===')
    console.log('posts found:', posts.length)
    console.log('totalCount:', totalCount)

    const currentPage = offset > 0 ? Math.floor(offset / limit) + 1 : page
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      posts,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    })
  } catch (error) {
    console.error('Posts fetch error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Failed to fetch posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 