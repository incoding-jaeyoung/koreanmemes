'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Shield, Lock } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, fallback, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const [hasSecretAccess, setHasSecretAccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 비밀 액세스 키 확인
    const accessKey = searchParams.get('access')
    const secretKey = 'korean-memes-secret-2024' // 환경변수와 동일하게
    
    if (accessKey === secretKey) {
      setHasSecretAccess(true)
      // 비밀 키로 접근할 때는 URL에서 access 파라미터 제거
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('access')
      window.history.replaceState({}, '', newUrl.toString())
    }
    
    setIsChecking(false)
  }, [searchParams])

  // 로딩 중
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">권한을 확인하는 중...</p>
        </div>
      </div>
    )
  }

  // 인증되지 않았고 비밀 액세스도 없는 경우
  if (!isAuthenticated && !hasSecretAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 필요합니다</h2>
            <p className="text-gray-600 mb-6">
              이 페이지에 접근하려면 관리자 로그인이 필요합니다.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const currentPath = window.location.pathname + window.location.search
                  router.push(`${redirectTo}?returnTo=${encodeURIComponent(currentPath)}`)
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                로그인하기
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 권한이 있는 경우 - 비밀 액세스로 접근했다면 알림 표시
  return (
    <>
      {hasSecretAccess && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              <strong>비밀 액세스로 접근했습니다.</strong> 관리자 권한으로 모든 기능을 사용할 수 있습니다.
            </p>
          </div>
        </div>
      )}
      {children}
    </>
  )
} 