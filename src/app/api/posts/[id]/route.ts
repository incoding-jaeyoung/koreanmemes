import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Category } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    // 게시글 조회 (조회수 증가 없이)
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        koreanTitle: true,
        content: true,
        koreanContent: true,
        extractedComments: true,
        translatedComments: true,
        category: true,
        imageUrl: true,
        additionalImages: true,
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

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // additionalImages, extractedComments, translatedComments가 JSON인 경우 배열로 변환
    const formattedPost = {
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
    }

    return NextResponse.json({ 
      post: formattedPost
    })

  } catch (error) {
    console.error('Post fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const body = await request.json()
    
    const { title, koreanTitle, content, koreanContent, category, imageUrl, additionalImages, extractedComments, translatedComments } = body

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

    // 게시글 존재 확인
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // 게시글 수정
    const updatedPost = await prisma.post.update({
      where: { id: postId },
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
      },
    })

    console.log('Post updated:', updatedPost.id)

    return NextResponse.json({ 
      success: true, 
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        category: updatedPost.category
      },
      message: 'Post updated successfully' 
    })

  } catch (error) {
    console.error('Post update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    // 게시글 존재 확인
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // 게시글 삭제
    await prisma.post.delete({
      where: { id: postId }
    })

    console.log('Post deleted:', postId)

    return NextResponse.json({ 
      success: true,
      message: 'Post deleted successfully' 
    })

  } catch (error) {
    console.error('Post delete error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 