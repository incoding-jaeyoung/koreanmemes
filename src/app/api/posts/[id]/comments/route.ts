import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

// 댓글 목록 조회 
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const comments = await prisma.comment.findMany({
      where: {
        postId: id,
        isBlocked: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        content: true,
        nickname: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            username: true
          }
        }
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('댓글 조회 에러:', error)
    return NextResponse.json(
      { error: '댓글을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content, nickname, password } = body

    if (!content?.trim()) {
      return NextResponse.json(
        { error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: '댓글은 1000자를 초과할 수 없습니다.' },
        { status: 400 }
      )
    }

    // IP 주소 가져오기 (스팸 방지용)
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: id,
        nickname: nickname?.trim() || '익명',
        password: password || null,
        ipAddress
      },
      select: {
        id: true,
        content: true,
        nickname: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('댓글 작성 에러:', error)
    return NextResponse.json(
      { error: '댓글 작성에 실패했습니다.' },
      { status: 500 }
    )
  }
} 