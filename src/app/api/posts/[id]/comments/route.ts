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

    // 각 댓글이 영문인 경우 실시간 번역 추가
    const commentsWithTranslation = await Promise.all(
      comments.map(async (comment) => {
        let translatedContent = null
        if (isEnglishText(comment.content)) {
          translatedContent = await translateToKorean(comment.content)
        }
        return {
          ...comment,
          translatedContent
        }
      })
    )

    console.log('Comments found:', commentsWithTranslation.length)
    return NextResponse.json(commentsWithTranslation)
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

    // 영문 댓글인 경우 한글로 번역 시도
    let translatedContent = null
    if (isEnglishText(content.trim())) {
      console.log('English comment detected, translating to Korean...')
      translatedContent = await translateToKorean(content.trim())
      console.log('Translation result:', translatedContent)
    }

    // 댓글 생성 (일단 translatedContent는 DB에 저장하지 않음)
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: id,
        nickname: nickname?.trim() || '익명',
        password: password.trim(),
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

    // 응답에 번역된 내용 추가
    const response = {
      ...comment,
      translatedContent
    }

    console.log('Comment created:', response.id)
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('댓글 작성 에러:', error)
    return NextResponse.json(
      { error: '댓글 작성에 실패했습니다.' },
      { status: 500 }
    )
  }
} 