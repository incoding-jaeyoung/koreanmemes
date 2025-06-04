import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@koreanmemes.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 디버그 로그 (프로덕션에서는 비밀번호 로깅 금지)
    console.log('Login attempt:', { 
      receivedEmail: email,
      expectedEmail: ADMIN_EMAIL,
      emailMatch: email === ADMIN_EMAIL,
      passwordProvided: !!password,
      passwordMatch: password === ADMIN_PASSWORD
    })

    // 간단한 관리자 계정 확인
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // JWT 토큰 생성
      const token = jwt.sign(
        { 
          email: ADMIN_EMAIL,
          role: 'admin',
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간
        },
        JWT_SECRET
      )

      const response = NextResponse.json({
        success: true,
        message: '로그인 성공',
        user: {
          email: ADMIN_EMAIL,
          role: 'admin'
        }
      })

      // HTTP-Only 쿠키로 토큰 설정
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 // 24시간
      })

      return response
    }

    return NextResponse.json({
      success: false,
      message: '이메일 또는 비밀번호가 올바르지 않습니다.'
    }, { status: 401 })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
} 