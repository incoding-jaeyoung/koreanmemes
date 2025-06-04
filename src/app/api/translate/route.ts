import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // 디버깅 정보 추가
    console.log('=== Translation API Debug Info ===')
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
    console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0)
    console.log('Request URL:', request.url)
    console.log('Request method:', request.method)

    const { text } = await request.json()
    console.log('Input text:', text)

    if (!text || !text.trim()) {
      console.log('No text provided')
      return NextResponse.json({ 
        success: false, 
        error: 'No text provided' 
      })
    }

    // 한글이 포함되어 있는지 확인
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
    if (!koreanRegex.test(text)) {
      console.log('No Korean text detected')
      return NextResponse.json({ 
        success: false, 
        error: 'No Korean text detected' 
      })
    }

    console.log('Korean text detected, starting translation...')

    // GPT로 번역
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a translator for Korean titles. Focus on literal translation while preserving the meaning and making it suitable for English-speaking audiences.

GUIDELINES:
• Translate Korean titles to clear, engaging English titles
• Keep titles concise and punchy for social media/blog format
• Preserve the original meaning and tone
• Make it suitable for English-speaking audiences interested in Korean culture
• Use natural English expressions
• Avoid overly literal translations that sound awkward
• Keep it under 80 characters when possible

EXAMPLES:
Korean: "한국 직장 문화: 눈치의 신비로운 세계"
English: "Korean Office Culture: The Mystery of 'Nunchi' Explained"

Korean: "김치찌개가 맛있는 이유"
English: "Why Kimchi Stew Hits Different"

Korean: "한국 드라마 속 로맨스의 진실"
English: "The Truth About Romance in K-Dramas"`
        },
        {
          role: "user",
          content: `Translate this Korean title to English: "${text}"`
        }
      ],
      max_tokens: 100,
      temperature: 0.3,
    })

    console.log('OpenAI response received')
    const translatedText = response.choices[0]?.message?.content?.trim()
    console.log('Translated text:', translatedText)
    
    if (!translatedText) {
      console.log('Translation failed - no content received')
      return NextResponse.json({ 
        success: false, 
        error: 'Translation failed' 
      })
    }

    // 따옴표 제거 (GPT가 가끔 따옴표로 감싸서 반환)
    const cleanedText = translatedText.replace(/^["']|["']$/g, '')
    console.log('Final translated text:', cleanedText)

    return NextResponse.json({ 
      success: true, 
      translatedText: cleanedText 
    })

  } catch (error) {
    console.error('Translation API error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Translation failed' 
    })
  }
} 