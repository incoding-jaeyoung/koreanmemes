import Tesseract from 'tesseract.js'
import OpenAI from 'openai'
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas'
import sharp from 'sharp'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface TextBlock {
  text: string
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
}

// 한글 감지 함수
function containsKorean(text: string): boolean {
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
  return koreanRegex.test(text)
}

// 텍스트 줄바꿈 처리 함수
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = ctx.measureText(testLine).width
    
    if (testWidth <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        // 단어 자체가 너무 길면 그대로 추가
        lines.push(word)
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines
}

// GPT로 번역
async function translateWithGPT(koreanText: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a translator for Korean memes and casual content. Focus on literal translation while preserving the original tone and humor.

GUIDELINES:
• Stay close to the literal meaning of the original Korean text
• Preserve the casual, humorous, or sarcastic tone of the original
• Keep translations concise and punchy
• Use natural English expressions but avoid excessive creative interpretation
• Maintain the original sentence structure when possible
• Use simple, direct language that fits the meme format
• Preserve Korean cultural nuances with brief, natural explanations if needed
• Avoid adding extra commentary or lengthy explanations

EXAMPLES:
Korean: "야, 니는 옷이다 어디 갔나?"
English: "Hey, where'd your clothes go?"

Korean: "눈 개높음"
English: "Standards way too high"

Korean: "저 다음 주 전역이라 다 나눠줬습니다"
English: "Getting discharged next week so I gave them all away"

Keep it simple, direct, and true to the original meaning while maintaining the casual tone.`
        },
        {
          role: "user",
          content: `Translate this Korean text, staying close to the literal meaning while keeping the tone: "${koreanText}"`
        }
      ],
      max_tokens: 150, // 토큰 수 줄임
      temperature: 0.3, // 창의성 줄임
    })

    return response.choices[0]?.message?.content?.trim() || koreanText
  } catch (error) {
    console.error('Translation error:', error)
    return koreanText // 번역 실패 시 원본 반환
  }
}

// 메인 번역 함수
export async function translateImageText(imageBuffer: Buffer): Promise<Buffer> {
  try {
    console.log('Starting image translation...')

    // 1. 단순하게 원본 이미지로만 OCR 수행
    const worker = await Tesseract.createWorker('kor', 1, {
      logger: m => console.log('OCR Progress:', m.status, m.progress)
    })

    let result
    try {
      // 2. 원본 이미지로 OCR 수행
      console.log('Starting OCR with original image...')
      result = await worker.recognize(imageBuffer)
      console.log('OCR completed:', result.data.text)
      console.log('OCR confidence:', result.data.confidence)
    } finally {
      // Worker 정리
      await worker.terminate()
    }

    // 3. 한글 텍스트 블록 찾기 - 실제 위치 우선 감지
    const koreanBlocks: TextBlock[] = []
    
    // OCR 데이터 처리
    const ocrData = result.data as unknown
    
    // 먼저 paragraphs 단위로 시도 (가장 정확한 단위)
    if (ocrData && typeof ocrData === 'object' && 'paragraphs' in ocrData) {
      const paragraphs = (ocrData as { paragraphs: Array<{ text: string; bbox: { x0: number; y0: number; x1: number; y1: number }; confidence: number }> }).paragraphs
      
      for (const paragraph of paragraphs) {
        if (paragraph.text && paragraph.bbox && containsKorean(paragraph.text)) {
          console.log('Korean paragraph found:', paragraph.text, 'at position:', paragraph.bbox)
          koreanBlocks.push({
            text: paragraph.text,
            bbox: {
              x0: paragraph.bbox.x0,
              y0: paragraph.bbox.y0,
              x1: paragraph.bbox.x1,
              y1: paragraph.bbox.y1
            }
          })
        }
      }
    }

    // paragraphs가 없으면 라인 단위로 시도
    if (koreanBlocks.length === 0 && ocrData && typeof ocrData === 'object' && 'lines' in ocrData) {
      const lines = (ocrData as { lines: Array<{ text: string; bbox: { x0: number; y0: number; x1: number; y1: number }; confidence: number }> }).lines
      
      for (const line of lines) {
        if (line.text && line.bbox && containsKorean(line.text)) {
          console.log('Korean line found:', line.text, 'at position:', line.bbox)
          koreanBlocks.push({
            text: line.text,
            bbox: {
              x0: line.bbox.x0,
              y0: line.bbox.y0,
              x1: line.bbox.x1,
              y1: line.bbox.y1
            }
          })
        }
      }
    }

    // 라인이 없으면 단어 단위로 시도하고 그룹화
    if (koreanBlocks.length === 0 && ocrData && typeof ocrData === 'object' && 'words' in ocrData) {
      const words = (ocrData as { words: Array<{ text: string; bbox: { x0: number; y0: number; x1: number; y1: number }; confidence: number }> }).words
      
      const koreanWords = words.filter(word => word.text && word.bbox && containsKorean(word.text))
      
      if (koreanWords.length > 0) {
        console.log(`Found ${koreanWords.length} Korean words, combining into blocks`)
        
        // 인접한 한글 단어들을 그룹화
        const groupedWords = []
        let currentGroup = [koreanWords[0]]
        
        for (let i = 1; i < koreanWords.length; i++) {
          const currentWord = koreanWords[i]
          const lastWord = currentGroup[currentGroup.length - 1]
          
          // 수직 거리로 같은 라인인지 판단 (높이 차이가 작으면 같은 라인)
          const verticalDistance = Math.abs(currentWord.bbox.y0 - lastWord.bbox.y0)
          const avgHeight = (currentWord.bbox.y1 - currentWord.bbox.y0 + lastWord.bbox.y1 - lastWord.bbox.y0) / 2
          
          if (verticalDistance < avgHeight * 0.5) {
            // 같은 라인으로 판단
            currentGroup.push(currentWord)
          } else {
            // 새로운 라인 시작
            groupedWords.push(currentGroup)
            currentGroup = [currentWord]
          }
        }
        groupedWords.push(currentGroup) // 마지막 그룹 추가
        
        // 각 그룹을 텍스트 블록으로 변환
        for (const group of groupedWords) {
          const combinedText = group.map(w => w.text).join(' ')
          const minX = Math.min(...group.map(w => w.bbox.x0))
          const minY = Math.min(...group.map(w => w.bbox.y0))
          const maxX = Math.max(...group.map(w => w.bbox.x1))
          const maxY = Math.max(...group.map(w => w.bbox.y1))
          
          console.log('Korean text block found:', combinedText, 'at position:', { x0: minX, y0: minY, x1: maxX, y1: maxY })
          koreanBlocks.push({
            text: combinedText,
            bbox: { x0: minX, y0: minY, x1: maxX, y1: maxY }
          })
        }
      }
    }

    // 마지막 fallback - 전체 텍스트로 처리하되 정확한 위치 찾기 시도
    if (koreanBlocks.length === 0 && result.data && result.data.text) {
      const fullText = result.data.text.trim()
      if (containsKorean(fullText)) {
        console.log('Korean text found (fallback):', fullText)
        
        // 원본 이미지 크기 가져오기
        const metadata = await sharp(imageBuffer).metadata()
        const width = metadata.width || 400
        const height = metadata.height || 300
        
        // 이미지 하단 영역에 배치 (보통 한글 텍스트가 하단에 있음)
        koreanBlocks.push({
          text: fullText,
          bbox: {
            x0: Math.floor(width * 0.1),
            y0: Math.floor(height * 0.6), // 하단 60% 위치부터
            x1: Math.floor(width * 0.9),
            y1: Math.floor(height * 0.9)  // 하단 90% 위치까지
          }
        })
      }
    }

    // 한글이 없으면 원본 반환
    if (koreanBlocks.length === 0) {
      console.log('No Korean text found, returning original image')
      return imageBuffer
    }

    console.log(`Found ${koreanBlocks.length} Korean text blocks`)

    // 4. 이미지 형식 변환 (webp 등 지원을 위해 PNG로 통일)
    const processedImageBuffer = await sharp(imageBuffer)
      .png()
      .toBuffer()

    // 5. 변환된 이미지로 Canvas 작업
    const originalImage = await loadImage(processedImageBuffer)
    const canvas = createCanvas(originalImage.width, originalImage.height)
    const ctx = canvas.getContext('2d')

    // 원본 이미지 그리기
    ctx.drawImage(originalImage, 0, 0)

    // 6. 각 한글 블록을 영어로 번역하여 정확한 위치에 교체
    for (const block of koreanBlocks) {
      const translatedText = await translateWithGPT(block.text)
      console.log(`Translated: "${block.text}" → "${translatedText}"`)

      // 한글 텍스트 위치 정보
      const { bbox } = block
      const originalWidth = bbox.x1 - bbox.x0
      const originalHeight = bbox.y1 - bbox.y0
      
      console.log(`Replacing text at: ${bbox.x0},${bbox.y0} size: ${originalWidth}x${originalHeight}`)

      // 텍스트 위주 이미지 감지 (이미지 대비 텍스트 영역이 큰 경우)
      const imageArea = canvas.width * canvas.height
      const textArea = originalWidth * originalHeight
      const textRatio = textArea / imageArea
      const isTextHeavyImage = textRatio > 0.15 // 텍스트 영역이 이미지의 15% 이상
      
      console.log(`Text ratio: ${(textRatio * 100).toFixed(1)}%, Text-heavy image: ${isTextHeavyImage}`)

      // 폰트 크기 계산 - 텍스트 위주 이미지는 고정 크기 사용
      let fontSize
      if (isTextHeavyImage) {
        // 텍스트 위주 이미지: 20px로 고정하여 일관성 확보
        fontSize = 20
      } else {
        // 일반 이미지: 기존 방식
        fontSize = Math.min(originalHeight * 0.8, originalWidth / translatedText.length * 1.5)
        fontSize = Math.max(fontSize, 12) // 최소 크기
        fontSize = Math.min(fontSize, originalHeight * 0.9) // 최대 크기
      }
      
      ctx.font = `bold ${fontSize}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 텍스트 줄바꿈 처리 - 텍스트 위주 이미지는 더 넓은 영역 활용
      let maxTextWidth
      if (isTextHeavyImage) {
        // 텍스트 위주 이미지: 한글 영역 너비의 95% 활용
        maxTextWidth = originalWidth * 0.95
      } else {
        // 일반 이미지: 한글 영역의 85% 활용
        maxTextWidth = originalWidth * 0.85
      }
      
      const lines = wrapText(ctx, translatedText, maxTextWidth)
      
      // 다중 라인 텍스트 크기 계산
      const lineHeight = fontSize * 1.5 // 줄 간격 늘림 (1.3 → 1.5)
      const totalTextHeight = lines.length * lineHeight
      const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
      
      // 박스 크기 계산 - 텍스트가 완전히 들어가도록 충분한 크기
      const padding = isTextHeavyImage ? 20 : 10 // 패딩 증가
      let boxWidth, boxHeight
      
      if (isTextHeavyImage) {
        // 텍스트 위주 이미지: 텍스트에 맞춘 박스 크기 + 충분한 여유공간
        boxWidth = maxLineWidth + padding * 2
        boxHeight = totalTextHeight + padding * 2
        
        // 박스가 한글 영역보다 작으면 한글 영역에 맞춤
        boxWidth = Math.max(boxWidth, originalWidth + 20) // 한글 영역보다 최소 20px 크게
        boxHeight = Math.max(boxHeight, originalHeight + 20) // 한글 영역보다 최소 20px 크게
      } else {
        // 일반 이미지: 기존 방식
        boxWidth = Math.min(maxLineWidth + padding * 2, originalWidth)
        boxHeight = Math.min(totalTextHeight + padding * 2, originalHeight)
      }
      
      // 박스 위치 계산
      let boxX, boxY
      if (isTextHeavyImage) {
        // 텍스트 위주 이미지: 한글 영역을 완전히 덮도록 확장된 박스
        // 한글 영역보다 약간 더 크게 만들어서 완전히 덮기
        const expandMargin = 10 // 한글 영역 주변으로 10px 확장
        boxWidth = Math.min(boxWidth, originalWidth + expandMargin * 2) // 한글 영역보다 약간 크게
        boxHeight = Math.max(boxHeight, originalHeight + expandMargin * 2) // 한글 영역보다 약간 크게
        
        // 한글 텍스트 영역을 중심으로 하되 완전히 덮도록 위치 계산
        boxX = bbox.x0 - expandMargin // 한글 시작점에서 여백만큼 왼쪽으로
        boxY = bbox.y0 - expandMargin // 한글 시작점에서 여백만큼 위로
        
        // 박스가 이미지를 벗어나지 않도록 조정
        if (boxX < 0) {
          boxWidth += boxX // 박스 너비에 음수값 추가 (실제로는 감소)
          boxX = 0
        }
        if (boxY < 0) {
          boxHeight += boxY // 박스 높이에 음수값 추가 (실제로는 감소)
          boxY = 0
        }
        if (boxX + boxWidth > canvas.width) {
          boxWidth = canvas.width - boxX
        }
        if (boxY + boxHeight > canvas.height) {
          boxHeight = canvas.height - boxY
        }
        
        console.log(`Covering Korean completely: Korean(${bbox.x0}, ${bbox.y0}, ${originalWidth}x${originalHeight}) -> Box(${boxX}, ${boxY}, ${boxWidth}x${boxHeight})`)
      } else {
        // 일반 이미지: 한글 텍스트 영역 중앙에 배치
        const koreanCenterX = bbox.x0 + originalWidth / 2
        const koreanCenterY = bbox.y0 + originalHeight / 2
        boxX = koreanCenterX - boxWidth / 2
        boxY = koreanCenterY - boxHeight / 2
      }
      
      console.log(`Final box position: (${boxX}, ${boxY}) size: ${boxWidth}x${boxHeight} in image: ${canvas.width}x${canvas.height}`)
      console.log(`Text lines: ${lines.length}, line height: ${lineHeight}, font size: ${fontSize}`)
      
      // 한글 텍스트를 완전히 덮는 흰색 배경
      ctx.fillStyle = 'white'
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight)
      
      // 깔끔한 경계선
      ctx.strokeStyle = '#ddd'
      ctx.lineWidth = 0.5
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

      // 다중 라인 영어 텍스트를 박스 중앙에 그리기
      ctx.fillStyle = 'black'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top' // 'middle'에서 'top'으로 변경하여 더 정확한 위치 계산
      
      // 전체 텍스트 블록의 시작 Y 위치 계산 (박스 중앙에 텍스트 배치)
      const textAreaHeight = totalTextHeight
      const startY = boxY + (boxHeight - textAreaHeight) / 2
      
      // 각 라인을 그리기
      lines.forEach((line, index) => {
        const lineY = startY + index * lineHeight + fontSize * 0.2 // 약간의 상단 여백 추가
        const lineX = boxX + boxWidth / 2
        ctx.fillText(line, lineX, lineY)
      })
    }

    // 7. Canvas를 Buffer로 변환
    const canvasBuffer = canvas.toBuffer('image/png')
    
    // 8. 적당한 품질로 최적화
    const optimizedBuffer = await sharp(canvasBuffer)
      .jpeg({ quality: 85 })
      .toBuffer()

    console.log('Simple image translation completed successfully')
    return optimizedBuffer

  } catch (error) {
    console.error('Image translation failed:', error)
    // 오류 발생 시 원본 이미지 반환
    return imageBuffer
  }
} 