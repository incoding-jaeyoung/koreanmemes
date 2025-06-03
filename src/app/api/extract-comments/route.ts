import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다' }, { status: 400 })
    }

    console.log('댓글 추출 시도:', url)

    // 웹페이지 가져오기 (인코딩 처리 개선)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 바이너리로 받아서 인코딩 처리
    const buffer = await response.arrayBuffer()
    const decoder = new TextDecoder('utf-8')
    const html = decoder.decode(buffer)
    
    const $ = cheerio.load(html, { decodeEntities: false })

    console.log('HTML 로드 완료, 특정 패턴 검색...')

    const comments: string[] = []

    // humoruniv.com 전용 댓글 추출
    // 실제 사이트 구조에 맞는 선택자들
    const commentSelectors = [
      '.comm_best_area .comm_txt',
      '.comm_best_area td',
      '.best_comm .comm_txt', 
      '.best_area .comm_txt',
      '.reply_best .comm_txt',
      '.comm_best_area .reply_txt',
      '.comm_best_area .memo',
      '.comm_best_area .comment',
      '.best_comment_area .comment_content',
      '.best_reply .reply_content'
    ]

    // 각 선택자로 시도
    for (const selector of commentSelectors) {
      const elements = $(selector)
      console.log(`${selector} 요소 개수:`, elements.length)
      
      if (elements.length > 0) {
        elements.each((index: number, element: cheerio.Element) => {
          let text = $(element).text().trim()
          
          // 기본 정리
          text = text
            .replace(/\s+/g, ' ')
            .replace(/^\d+\s*/, '') // 앞의 숫자 제거
            .trim()
          
          console.log(`${selector} 텍스트:`, text)
          
          // 한글이 포함되고 적절한 길이면 추가
          if (/[가-힣]/.test(text) && text.length >= 5 && text.length <= 300) {
            comments.push(text)
          }
        })
        
        if (comments.length > 0) break
      }
    }

    // 더 넓은 범위에서 댓글 찾기
    if (comments.length === 0) {
      console.log('넓은 범위에서 댓글 검색...')
      
      // 테이블 기반 구조에서 댓글 찾기
      $('table tr td').each((index: number, element: cheerio.Element) => {
        const $td = $(element)
        let text = $td.text().trim()
        
        // 한글이 많이 포함된 셀만 확인
        if (/[가-힣]/.test(text) && text.length >= 10 && text.length <= 500) {
          // 댓글 같은 패턴 확인
          if (text.includes('ㅋ') || text.includes('ㅎ') || text.includes('...') || 
              text.includes('!') || text.includes('?') || text.includes('ㅠ') ||
              text.includes('ㅜ') || text.includes('ㅡ')) {
            
            // 불필요한 부분 제거
            text = text
              .replace(/베스트\d*\s*/g, '')
              .replace(/\d{4}-\d{2}-\d{2}.*?\d{2}:\d{2}/g, '')
              .replace(/추천\s*\d+\s*반대\s*\d*/g, '')
              .replace(/\[\d+\]/g, '')
              .replace(/^\s*\d+\s*/, '')
              .replace(/\s+/g, ' ')
              .trim()
            
            console.log('댓글 후보:', text)
            
            if (text.length >= 10 && text.length <= 300) {
              comments.push(text)
            }
          }
        }
      })
    }

    // 마지막 시도: 모든 텍스트에서 댓글 패턴 찾기
    if (comments.length === 0) {
      console.log('전체 텍스트에서 댓글 패턴 검색...')
      
      $('*').each((index: number, element: cheerio.Element) => {
        const text = $(element).text().trim()
        
        // 댓글 패턴: 한글 + 감정표현 + 적절한 길이
        if (/[가-힣]/.test(text) && 
            text.length >= 10 && 
            text.length <= 200 &&
            (text.includes('ㅋㅋ') || text.includes('ㅎㅎ') || 
             text.includes('ㅠㅠ') || text.includes('ㅜㅜ') ||
             text.includes('...') || text.includes('!!!'))) {
          
          // 메뉴나 네비게이션 텍스트 제외
          if (!text.includes('로그인') && 
              !text.includes('회원가입') && 
              !text.includes('검색') &&
              !text.includes('메뉴') &&
              !text.includes('홈') &&
              !text.includes('게시판')) {
            
            console.log('최종 댓글 후보:', text.substring(0, 100))
            comments.push(text)
          }
        }
      })
    }

    console.log(`총 ${comments.length}개의 댓글 추출`)

    // 중복 제거 및 정리
    const uniqueComments = [...new Set(comments)]
      .filter(comment => {
        const cleaned = comment.trim()
        return cleaned.length >= 10 && 
               cleaned.length <= 300 && 
               /[가-힣]/.test(cleaned)
      })
      .slice(0, 10)

    if (uniqueComments.length === 0) {
      // 실패 시 디버그 정보 제공
      const debugInfo = {
        htmlPreview: html.substring(0, 1000),
        commBestAreaExists: $('.comm_best_area').length > 0,
        tableCount: $('table').length,
        tdCount: $('td').length,
        totalElements: $('*').length
      }
      
      console.log('디버그 정보:', debugInfo)
      
      return NextResponse.json({ 
        error: '댓글을 추출할 수 없습니다. 웹사이트 구조가 예상과 다를 수 있습니다.',
        comments: [],
        debug: debugInfo
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      comments: uniqueComments,
      total: uniqueComments.length
    })

  } catch (error) {
    console.error('댓글 추출 오류:', error)
    return NextResponse.json({ 
      error: '댓글 추출 중 오류가 발생했습니다: ' + (error as Error).message 
    }, { status: 500 })
  }
} 