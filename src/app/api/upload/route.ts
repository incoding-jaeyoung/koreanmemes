import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    console.log('Environment check:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
      openai_key: process.env.OPENAI_API_KEY ? 'Set' : 'Missing'
    })

    const formData = await request.formData()
    const file = formData.get('image') as File
    const translateImage = formData.get('translateImage') !== 'false'
    const ocrOnly = formData.get('ocrOnly') === 'true' // OCR 전용 모드

    if (!file) {
      console.error('No file provided')
      return NextResponse.json({ success: false, error: 'No file provided' })
    }

    console.log('File info:', {
      name: file.name,
      size: file.size,
      type: file.type,
      translateImage,
      ocrOnly
    })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // OCR 전용 모드: 번역된 텍스트만 반환
    if (ocrOnly) {
      console.log('OCR only mode - extracting and translating text')
      
      try {
        // OCR만 수행하고 번역된 텍스트 반환
        const translatedText = await extractAndTranslateText(buffer)
        
        if (!translatedText) {
          console.log('No Korean text found in selection')
          return NextResponse.json({ 
            success: false, 
            error: 'No Korean text found in the selected area' 
          })
        }

        console.log('OCR translation completed:', translatedText)
        return NextResponse.json({ 
          success: true, 
          translatedText 
        })
      } catch (error) {
        console.error('OCR translation error:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to extract or translate text' 
        })
      }
    }

    // 기존 이미지 업로드 로직
    let processedBuffer: Buffer = buffer
    
    if (translateImage) {
      console.log('Starting image translation...')
      try {
        const { translateImageText } = await import('@/lib/imageTranslator')
        processedBuffer = await translateImageText(buffer) as Buffer
        console.log('Image translation completed')
      } catch (error) {
        console.error('Image translation failed:', error)
        console.log('Proceeding with original image due to translation failure')
        processedBuffer = buffer
      }
    }

    console.log('Starting Cloudinary upload...')
    
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "korean-memes",
          quality: "auto",
          fetch_format: "auto"
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else if (result) {
            console.log('Cloudinary upload success:', result.public_id)
            resolve({ secure_url: result.secure_url, public_id: result.public_id })
          } else {
            reject(new Error('Upload failed - no result'))
          }
        }
      ).end(processedBuffer)
    })

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    })
  }
}

// OCR 및 번역 전용 함수 - OpenAI Vision API 사용
async function extractAndTranslateText(imageBuffer: Buffer): Promise<string | null> {
  try {
    const OpenAI = (await import('openai')).default

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // 이미지를 base64로 변환
    const base64Image = imageBuffer.toString('base64')
    const mimeType = 'image/png' // 기본값으로 PNG 사용

    console.log('Using OpenAI Vision API for OCR and translation...')

    // OpenAI Vision API로 한 번에 OCR + 번역 수행
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at reading Korean text from images and translating it to English. 

TASK:
1. Extract any Korean text you see in the image
2. If Korean text is found, translate it to English following these guidelines:
   - Stay close to the literal meaning
   - Preserve casual, humorous, or sarcastic tone
   - Keep translations concise and punchy
   - Use natural English expressions
   - Maintain the original sentence structure when possible

RESPONSE FORMAT:
- If Korean text is found: return ONLY the English translation
- If no Korean text is found: return "NO_KOREAN_TEXT"

EXAMPLES:
Korean: "야, 니는 옷이다 어디 갔나?" → "Hey, where'd your clothes go?"
Korean: "눈 개높음" → "Standards way too high"
Korean: "저 다음 주 전역이라 다 나눠줬습니다" → "Getting discharged next week so I gave them all away"`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract and translate any Korean text you see in this image:"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    })

    const result = response.choices[0]?.message?.content?.trim()
    console.log('Vision API result:', result)
    
    if (!result || result === "NO_KOREAN_TEXT") {
      console.log('No Korean text detected by Vision API')
      return null
    }

    return result
  } catch (error) {
    console.error('Vision API error:', error)
    return null
  }
} 