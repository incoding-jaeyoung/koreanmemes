import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Category } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // 환경변수 디버깅 추가
    console.log('=== POST Environment Variables Debug ===')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL value:', process.env.DATABASE_URL)
    console.log('Prisma client status:', typeof prisma)

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
    // 환경변수 디버깅 추가
    console.log('=== Environment Variables Debug ===')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL value:', process.env.DATABASE_URL)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('All env keys:', Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || 
      key.includes('ADMIN') || 
      key.includes('JWT') || 
      key.includes('CLOUDINARY') || 
      key.includes('OPENAI')
    ))

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Category enum에 포함된 값인지 확인
    const whereClause = category && category !== 'ALL' && Object.values(Category).includes(category as Category)
      ? { category: category as Category } 
      : {}

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
} 