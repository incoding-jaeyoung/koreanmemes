import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

interface JWTPayload {
  email: string
  role: string
  exp: number
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({
        success: false,
        message: '인증되지 않은 사용자입니다.'
      }, { status: 401 })
    }

    // JWT 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    return NextResponse.json({
      success: true,
      user: {
        email: decoded.email,
        role: decoded.role
      }
    })

  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json({
      success: false,
      message: '인증 토큰이 유효하지 않습니다.'
    }, { status: 401 })
  }
} 