import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 한국어 텍스트 감지 함수
const isKoreanText = (text: string): boolean => {
  const koreanRegex = /[\u3131-\u3163\uac00-\ud7a3]/g
  const koreanMatches = text.match(koreanRegex)
  const koreanCharCount = koreanMatches ? koreanMatches.length : 0
  const totalCharCount = text.replace(/\s/g, '').length // 공백 제외
  
  if (totalCharCount === 0) return false
  
  const koreanPercentage = koreanCharCount / totalCharCount
  return koreanPercentage >= 0.6 // 60% 이상이 한국어이면 한국어 텍스트로 판단
}

// 영문 텍스트 감지 함수
const isEnglishText = (text: string): boolean => {
  // 영문 알파벳이 전체 텍스트의 60% 이상인 경우 영문으로 판단
  const englishChars = text.match(/[a-zA-Z]/g) || []
  const totalChars = text.replace(/\s/g, '').length // 공백 제외
  return totalChars > 0 && (englishChars.length / totalChars) >= 0.6
}

// 한글을 영문으로 번역
const translateToEnglish = async (text: string): Promise<string | null> => {
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
            content: 'You are a translator. Translate the given Korean text to English naturally and accurately. Translation guidelines: "밈" should be translated as "meme". Only respond with the English translation, no other text.'
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
    console.error('Translation to English failed:', error)
  }
  return null
}

// 영문을 한글로 번역
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
            content: 'You are a translator. Translate the given English text to Korean naturally and accurately. Translation guidelines: "meme" should be translated as "밈" (not "미미"). Only respond with the Korean translation, no other text.'
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
    console.error('Translation to Korean failed:', error)
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

    // 번역되지 않은 댓글들을 자동으로 번역 (현재는 실시간으로만 처리)
    const commentsWithTranslation = await Promise.all(
      comments.map(async (comment) => {
        let translatedContent = null
        
        // OpenAI API 키가 있을 때만 번역 시도
        if (process.env.OPENAI_API_KEY) {
          try {
            if (isKoreanText(comment.content)) {
              // 한글 댓글 -> 영문 번역
              console.log('한글 댓글 번역 중:', comment.content)
              translatedContent = await translateToEnglish(comment.content)
              console.log('영문 번역 완료:', translatedContent)
            } else if (isEnglishText(comment.content)) {
              // 영문 댓글 -> 한글 번역
              console.log('영문 댓글 번역 중:', comment.content)
              translatedContent = await translateToKorean(comment.content)
              console.log('한글 번역 완료:', translatedContent)
            }
            
            // TODO: 나중에 DB에 저장 기능 추가
            // if (translatedContent) {
            //   await prisma.comment.update({
            //     where: { id: comment.id },
            //     data: { translatedContent }
            //   })
            // }
          } catch (error) {
            console.warn('Translation failed for comment:', comment.id, error)
            // 번역 실패해도 댓글은 정상 표시
          }
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

    // 비밀번호 검증 강화
    if (!password || typeof password !== 'string' || password.trim().length < 4) {
      return NextResponse.json(
        { error: '비밀번호는 4글자 이상 입력해주세요.' },
        { status: 400 }
      )
    }

    // IP 주소 가져오기 (스팸 방지용)
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // 한글/영문 댓글에 따라 번역 시도
    let translatedContent = null
    try {
      if (process.env.OPENAI_API_KEY) {
        if (isKoreanText(content.trim())) {
          console.log('Korean comment detected, translating to English...')
          translatedContent = await translateToEnglish(content.trim())
          console.log('English translation result:', translatedContent)
        } else if (isEnglishText(content.trim())) {
          console.log('English comment detected, translating to Korean...')
          translatedContent = await translateToKorean(content.trim())
          console.log('Korean translation result:', translatedContent)
        }
      }
    } catch (error) {
      console.warn('Translation failed during comment creation:', error)
      // 번역 실패해도 댓글 작성은 계속 진행
    }

    // 댓글 생성 (일단 translatedContent는 DB에 저장하지 않음)
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: id,
        nickname: nickname?.trim() || 'Anonymous',
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