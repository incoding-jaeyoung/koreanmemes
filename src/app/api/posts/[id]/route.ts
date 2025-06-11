import { NextRequest, NextResponse } from 'next/server'
import { Category } from '@/generated/prisma'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const post = await prisma.post.findUnique({
      where: { id },
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
        updatedAt: true
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // 이전 포스트 조회 (현재 포스트보다 이후에 작성된 것 중 가장 이전 - 더 최근 포스트)
    const prevPost = await prisma.post.findFirst({
      where: {
        createdAt: {
          gt: post.createdAt
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        title: true
      }
    })

    // 다음 포스트 조회 (현재 포스트보다 이전에 작성된 것 중 가장 최근 - 더 오래된 포스트)
    const nextPost = await prisma.post.findFirst({
      where: {
        createdAt: {
          lt: post.createdAt
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true
      }
    })

    return NextResponse.json({
      post,
      navigation: {
        prev: prevPost,
        next: nextPost
      }
    })
  } catch (error) {
    console.error('Get post error:', error)
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

    // 이미지 URL 처리 - 수정 시에는 기존 이미지가 없고 새로운 이미지도 없을 때만 기본 이미지 사용
    const defaultImageUrl = '/image.png'
    let finalImageUrl = imageUrl
    
    // 이미지가 명시적으로 null이거나 빈 문자열로 설정되고, 기존 포스트에도 이미지가 없었다면 기본 이미지 사용
    if (!imageUrl && !existingPost.imageUrl) {
      finalImageUrl = defaultImageUrl
    } else if (!imageUrl && existingPost.imageUrl) {
      // 이미지가 제공되지 않았지만 기존 이미지가 있다면 기존 이미지 유지
      finalImageUrl = existingPost.imageUrl
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
        imageUrl: finalImageUrl,
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