import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { smartOCR, getCacheStats } from '@/lib/smart-ocr'

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    console.log('🌟 Smart OCR Upload API Started')
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
    const translatedTitle = formData.get('translatedTitle')?.toString() || undefined

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

    // OCR 전용 모드: 스마트 OCR 시스템 사용
    if (ocrOnly) {
      console.log('🎯 OCR only mode - using Smart OCR System')
      
      try {
        const ocrResult = await smartOCR(buffer)
        
        if (!ocrResult || !ocrResult.text) {
          console.log('❌ No Korean text found in selection')
          return NextResponse.json({ 
            success: false, 
            error: 'No Korean text found in the selected area' 
          })
        }

        // 캐시 통계 로깅
        const cacheStats = getCacheStats()
        console.log('📊 OCR completed:', {
          method: ocrResult.method,
          cost: ocrResult.cost,
          confidence: ocrResult.confidence,
          textLength: ocrResult.text.length,
          cacheStats
        })

        return NextResponse.json({ 
          success: true, 
          translatedText: ocrResult.text,
          metadata: {
            method: ocrResult.method,
            cost: ocrResult.cost,
            confidence: ocrResult.confidence,
            cacheHit: ocrResult.method === 'cache'
          }
        })
      } catch (error) {
        console.error('💥 Smart OCR error:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to extract or translate text' 
        })
      }
    }

    // 기존 이미지 업로드 로직
    let processedBuffer: Buffer = buffer
    
    if (translateImage) {
      console.log('🖼️ Starting image translation...')
      try {
        const { translateImageText } = await import('@/lib/imageTranslator')
        processedBuffer = await translateImageText(buffer, translatedTitle) as Buffer
        console.log('✅ Image translation completed')
      } catch (error) {
        console.error('💥 Image translation failed:', error)
        console.log('⚠️ Proceeding with original image due to translation failure')
        processedBuffer = buffer
      }
    }

    console.log('☁️ Starting Cloudinary upload...')
    
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
            console.error('💥 Cloudinary upload error:', error)
            reject(error)
          } else if (result) {
            console.log('✅ Cloudinary upload success:', result.public_id)
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
    console.error('💥 Upload API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    })
  }
} 