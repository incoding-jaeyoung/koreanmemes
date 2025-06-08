import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    // 게시글 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, views: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // 조회수 증가
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { views: post.views + 1 }
    })

    return NextResponse.json({ 
      success: true,
      views: updatedPost.views
    })

  } catch (error) {
    console.error('View increment error:', error)
    return NextResponse.json(
      { error: 'Failed to increment views' },
      { status: 500 }
    )
  }
} 