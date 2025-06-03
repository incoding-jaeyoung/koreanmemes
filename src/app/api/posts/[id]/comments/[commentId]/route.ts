import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

// 댓글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params
    const body = await request.json()
    const { content, password } = body

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

    // 댓글 존재 확인 및 비밀번호 검증
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 비밀번호가 설정되어 있지 않은 경우
    if (!existingComment.password) {
      return NextResponse.json(
        { error: '이 댓글은 수정할 수 없습니다. (비밀번호가 설정되지 않음)' },
        { status: 403 }
      )
    }

    // 비밀번호 확인 (해시되지 않은 단순 비교)
    if (existingComment.password !== password) {
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다.' },
        { status: 403 }
      )
    }

    // 댓글 수정
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        content: true,
        nickname: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('댓글 수정 에러:', error)
    return NextResponse.json(
      { error: '댓글 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 댓글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params
    const body = await request.json()
    const { password } = body

    // 댓글 존재 확인 및 비밀번호 검증
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 비밀번호가 설정되어 있지 않은 경우
    if (!existingComment.password) {
      return NextResponse.json(
        { error: '이 댓글은 삭제할 수 없습니다. (비밀번호가 설정되지 않음)' },
        { status: 403 }
      )
    }

    // 비밀번호 확인
    if (existingComment.password !== password) {
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다.' },
        { status: 403 }
      )
    }

    // 댓글 삭제
    await prisma.comment.delete({
      where: { id: commentId }
    })

    return NextResponse.json({ 
      success: true, 
      message: '댓글이 삭제되었습니다.' 
    })
  } catch (error) {
    console.error('댓글 삭제 에러:', error)
    return NextResponse.json(
      { error: '댓글 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
} 