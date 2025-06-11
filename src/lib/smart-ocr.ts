import crypto from 'crypto'
import sharp from 'sharp'
import { createWorker, PSM } from 'tesseract.js'

// 메모리 캐시 (프로덕션에서는 Redis 사용 권장)
const ocrCache = new Map<string, CacheEntry>()
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24시간

interface CacheEntry {
  result: string
  timestamp: number
  method: 'tesseract' | 'openai'
}

interface OCRResult {
  text: string
  method: 'tesseract' | 'openai' | 'cache'
  confidence?: number
  cost: 'free' | 'paid'
}

// 이미지 최적화 - 토큰 비용 절약
async function optimizeImageForOCR(buffer: Buffer): Promise<Buffer> {
  try {
    console.log('🔧 Optimizing image for OCR...')
    
    const metadata = await sharp(buffer).metadata()
    console.log('Original image:', metadata.width + 'x' + metadata.height, `${Math.round(buffer.length / 1024)}KB`)
    
    // 최적 크기로 리사이징 (토큰 비용 최소화)
    const optimized = await sharp(buffer)
      .resize(1024, 1024, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer()
    
    const reduction = Math.round(((buffer.length - optimized.length) / buffer.length) * 100)
    console.log('✅ Image optimized:', `${Math.round(optimized.length / 1024)}KB`, `(${reduction}% reduction)`)
    
    return optimized
  } catch (error) {
    console.warn('⚠️ Image optimization failed, using original:', error)
    return buffer
  }
}

// 이미지 해시 생성 - 캐싱용
function generateImageHash(buffer: Buffer): string {
  return crypto.createHash('md5').update(buffer).digest('hex')
}

// 캐시 정리
function cleanExpiredCache(): void {
  const now = Date.now()
  for (const [key, entry] of ocrCache.entries()) {
    if (now - entry.timestamp > CACHE_EXPIRY) {
      ocrCache.delete(key)
    }
  }
}

// 한글 품질 평가
function evaluateKoreanText(text: string): { 
  score: number; 
  koreanChars: number; 
  totalChars: number;
  hasSlang: boolean;
} {
  if (!text || typeof text !== 'string') {
    return { score: 0, koreanChars: 0, totalChars: 0, hasSlang: false }
  }

  const koreanChars = (text.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g) || []).length
  const totalChars = text.replace(/\s/g, '').length
  
  // 한국 밈/슬랭 패턴 감지
  const slangPatterns = [
    /ㅇㅈ|ㄹㅇ|ㅇㄷ|ㄱㅅ|ㅅㅂ|ㅁㅊ/,  // 초성 슬랭
    /갑분싸|존맛|빡|띵|개웃|급식|썰/,      // 줄임말/신조어
    /ㅋㅋ|ㅎㅎ|ㅠㅠ|ㄷㄷ/,              // 이모티콘
    /님|형|누나|언니|오빠/                // 호칭
  ]
  
  const hasSlang = slangPatterns.some(pattern => pattern.test(text))
  
  let score = 0
  if (koreanChars > 3) score += 30
  if (koreanChars / totalChars > 0.3) score += 20
  if (hasSlang) score += 25 // 슬랭이 있으면 가점
  if (text.length > 5) score += 15
  if (text.length < 50) score += 10 // 짧은 텍스트 선호
  
  return { score, koreanChars, totalChars, hasSlang }
}

// Tesseract.js를 이용한 한글 OCR (무료)
async function tesseractOCR(buffer: Buffer): Promise<{ text: string; confidence: number } | null> {
  let worker: Tesseract.Worker | null = null
  
  try {
    console.log('🆓 Trying Tesseract OCR (free)...')
    
    worker = await createWorker('kor')
    await worker.setParameters({
      tessedit_char_whitelist: '가-힣ㄱ-ㅎㅏ-ㅣ0-9abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ !@#$%^&*()_+-=[]{}|;:,.<>?~',
      tessedit_pageseg_mode: PSM.AUTO,
    })
    
    const { data } = await worker.recognize(buffer)
    const cleanText = data.text.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ')
    
    const evaluation = evaluateKoreanText(cleanText)
    console.log('Tesseract result:', {
      text: cleanText.substring(0, 50) + '...',
      confidence: data.confidence,
      evaluation
    })
    
    await worker.terminate()
    
    // 품질이 좋으면 결과 반환
    if (evaluation.score >= 40 && data.confidence > 50) {
      console.log('✅ Tesseract succeeded with good quality')
      return { text: cleanText, confidence: data.confidence }
    }
    
    console.log('❌ Tesseract quality too low, will try OpenAI')
    return null
    
  } catch (error) {
    console.warn('⚠️ Tesseract OCR failed:', error)
    if (worker) {
      try {
        await worker.terminate()
      } catch (e) {
        // Worker 종료 실패는 무시
      }
    }
    return null
  }
}

// OpenAI Vision API로 한국 밈 특화 OCR + 번역
async function openaiVisionOCR(buffer: Buffer): Promise<string | null> {
  try {
    console.log('💰 Using OpenAI Vision API (paid)...')
    
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const base64Image = buffer.toString('base64')
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a Korean meme expert who extracts and translates Korean text into natural English.

CRITICAL RULES:
- Return ONLY the English translation 
- NO Korean text in response
- NO labels like "Translation:" or "English:"
- NO explanations or meta-text
- Just the clean English translation

KOREAN SLANG EXPERTISE:
- ㅇㅈ = 인정 → "Agreed" / "Facts" 
- ㄹㅇ = 리얼 → "For real"
- ㅇㄷ = 어디 → "Where"
- ㄱㅅ = 감사 → "Thanks"
- 갑분싸 = 갑자기 분위기 싸해짐 → "Suddenly awkward"
- 존맛탱 → "Absolutely delicious"
- 띵작 → "Masterpiece"
- 개웃김 → "Hilarious AF"
- 빡대가리 → "Dumbass"
- 급식충 → "Middle schooler" (derogatory)
- 썰 → "Story time"
- 군대 → military service context
- 치킨 → Korean fried chicken culture

STYLE GUIDELINES:
1. Keep the casual, humorous tone
2. Use natural English slang
3. Make it punchy and concise
4. Preserve the original vibe

RESPONSE FORMAT:
- Korean text found → Return clean English translation only
- No Korean text → Return "NO_KOREAN_TEXT"`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract Korean text from this image and return ONLY the English translation (no Korean text, no labels):"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 200,
      temperature: 0.3, // 일관성을 위해 낮춤
    })

    const result = response.choices[0]?.message?.content?.trim()
    
    if (!result || result === "NO_KOREAN_TEXT") {
      console.log('❌ OpenAI: No Korean text detected')
      return null
    }

    // 혹시 모를 메타텍스트 제거
    const cleanResult = result
      .replace(/^Translation:\s*/i, '')
      .replace(/^English:\s*/i, '')
      .replace(/^번역:\s*/i, '')
      .replace(/^영어:\s*/i, '')
      .replace(/"/g, '') // 따옴표 제거
      .trim()

    console.log('✅ OpenAI Vision succeeded:', cleanResult.substring(0, 100) + '...')
    return cleanResult

  } catch (error) {
    console.error('💥 OpenAI Vision API error:', error)
    return null
  }
}

// 텍스트만 번역 (Tesseract 결과용)
async function translateKoreanText(koreanText: string): Promise<string | null> {
  try {
    console.log('🔄 Translating Korean text with OpenAI...')
    
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 번역만이므로 저렴한 모델 사용
      messages: [
        {
          role: "system",
          content: `You are a Korean-English translator specializing in internet slang and meme culture.

CRITICAL RULES:
- Return ONLY the English translation
- NO Korean text in response  
- NO labels like "Translation:" or "English:"
- NO explanations or quotes
- Just the clean English translation

SLANG TRANSLATIONS:
- ㅇㅈ = "Agreed" / "Facts"
- ㄹㅇ = "For real"
- 갑분싸 = "Suddenly awkward" 
- 존맛탱 = "Absolutely delicious"
- 개웃김 = "Hilarious AF"
- 띵작 = "Masterpiece"
- 급식충 = "Middle schooler" (derogatory)
- 썰 = "Story time"
- 빡대가리 = "Dumbass"

Keep the casual, humorous tone and energy of the original Korean text.`
        },
        {
          role: "user",
          content: `Translate to English only (no Korean, no labels): "${koreanText}"`
        }
      ],
      max_tokens: 150,
      temperature: 0.3,
    })

    const translation = response.choices[0]?.message?.content?.trim()
    
    if (!translation) {
      return null
    }
    
    // 혹시 모를 메타텍스트 제거
    const cleanTranslation = translation
      .replace(/^Translation:\s*/i, '')
      .replace(/^English:\s*/i, '')
      .replace(/^번역:\s*/i, '')
      .replace(/^영어:\s*/i, '')
      .replace(/"/g, '') // 따옴표 제거
      .trim()
    
    console.log('✅ Translation completed:', cleanTranslation.substring(0, 100) + '...')
    return cleanTranslation

  } catch (error) {
    console.error('💥 Translation error:', error)
    return null
  }
}

// 메인 스마트 OCR 함수
export async function smartOCR(imageBuffer: Buffer): Promise<OCRResult | null> {
  try {
    console.log('🚀 Starting Smart OCR System...')
    
    // 1단계: 이미지 최적화
    const optimizedBuffer = await optimizeImageForOCR(imageBuffer)
    
    // 2단계: 캐시 확인
    const imageHash = generateImageHash(optimizedBuffer)
    cleanExpiredCache()
    
    const cachedResult = ocrCache.get(imageHash)
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_EXPIRY) {
      console.log('💾 Cache hit! Saved API call')
      return {
        text: cachedResult.result,
        method: 'cache',
        cost: 'free'
      }
    }
    
    // 3단계: Tesseract 시도 (무료)
    const tesseractResult = await tesseractOCR(optimizedBuffer)
    
    if (tesseractResult) {
      console.log('🎯 Tesseract found good Korean text, translating...')
      
      const translation = await translateKoreanText(tesseractResult.text)
      
      if (translation) {
        // 캐시에 저장
        ocrCache.set(imageHash, {
          result: translation,
          timestamp: Date.now(),
          method: 'tesseract'
        })
        
        return {
          text: translation,
          method: 'tesseract',
          confidence: tesseractResult.confidence,
          cost: 'free'
        }
      }
    }
    
    // 4단계: OpenAI Vision API (유료)
    console.log('💡 Falling back to OpenAI Vision API...')
    const openaiResult = await openaiVisionOCR(optimizedBuffer)
    
    if (openaiResult) {
      // 캐시에 저장
      ocrCache.set(imageHash, {
        result: openaiResult,
        timestamp: Date.now(),
        method: 'openai'
      })
      
      return {
        text: openaiResult,
        method: 'openai',
        cost: 'paid'
      }
    }
    
    console.log('❌ All OCR methods failed')
    return null
    
  } catch (error) {
    console.error('💥 Smart OCR system error:', error)
    return null
  }
}

// 캐시 통계
export function getCacheStats() {
  cleanExpiredCache()
  
  const stats = {
    totalEntries: ocrCache.size,
    tesseractEntries: 0,
    openaiEntries: 0,
    oldestEntry: Date.now(),
    newestEntry: 0
  }
  
  for (const entry of ocrCache.values()) {
    if (entry.method === 'tesseract') stats.tesseractEntries++
    if (entry.method === 'openai') stats.openaiEntries++
    if (entry.timestamp < stats.oldestEntry) stats.oldestEntry = entry.timestamp
    if (entry.timestamp > stats.newestEntry) stats.newestEntry = entry.timestamp
  }
  
  return stats
}

// 캐시 수동 정리
export function clearCache() {
  ocrCache.clear()
  console.log('🧹 OCR cache cleared')
} 