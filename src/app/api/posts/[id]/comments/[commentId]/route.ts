import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

// 영문 텍스트 감지 함수
const isEnglishText = (text: string): boolean => {
  // 영문 알파벳이 전체 텍스트의 60% 이상인 경우 영문으로 판단
  const englishChars = text.match(/[a-zA-Z]/g) || []
  const totalChars = text.replace(/\s/g, '').length // 공백 제외
  return totalChars > 0 && (englishChars.length / totalChars) >= 0.6
}

// 텍스트 번역 함수
const translateToKorean = async (text: string): Promise<string | null> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a translator. Translate the given English text to Korean naturally and accurately. Only respond with the Korean translation, no other text.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.choices[0]?.message?.content?.trim() || null
    }
  } catch (error) {
    console.error('Translation failed:', error)
  }
  return null
}

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

    // 영문 댓글인 경우 한글로 번역 시도
    let translatedContent = null
    if (isEnglishText(content.trim())) {
      console.log('English comment detected, translating to Korean...')
      translatedContent = await translateToKorean(content.trim())
      console.log('Translation result:', translatedContent)
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

    // 응답에 번역된 내용 추가
    const response = {
      ...updatedComment,
      translatedContent
    }

    return NextResponse.json(response)
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