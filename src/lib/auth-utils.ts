import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY || 'korean-memes-secret-2024'

interface JWTPayload {
  email: string
  role: string
  exp: number
}

// 서버사이드에서 토큰 검증
export async function verifyAuth(): Promise<{ isAuthenticated: boolean; user?: { email: string; role: string } }> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return { isAuthenticated: false }
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    
    return {
      isAuthenticated: true,
      user: {
        email: decoded.email,
        role: decoded.role
      }
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { isAuthenticated: false }
  }
}

// URL 파라미터에서 비밀 액세스 키 확인
export function checkSecretAccess(searchParams: URLSearchParams): boolean {
  const accessKey = searchParams.get('access')
  return accessKey === SECRET_ACCESS_KEY
}

// 전체 권한 체크 (로그인 또는 비밀 키)
export async function hasWriteAccess(searchParams?: URLSearchParams): Promise<boolean> {
  // 1. 로그인 상태 확인
  const authResult = await verifyAuth()
  if (authResult.isAuthenticated) {
    return true
  }

  // 2. 비밀 액세스 키 확인
  if (searchParams && checkSecretAccess(searchParams)) {
    return true
  }

  return false
} 