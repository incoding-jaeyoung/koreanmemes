'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'

interface OCRStats {
  cache: {
    totalEntries: number
    tesseractEntries: number
    openaiEntries: number
    oldestEntryHours: number
    newestEntryMinutes: number
  }
  performance: {
    totalRequests: number
    freeRequests: number
    paidRequests: number
    freeRatio: number
  }
  cost: {
    savedMoney: string
    spentMoney: string
    totalCostWithoutOptimization: string
    actualCost: string
    savingsPercent: number
  }
  efficiency: {
    cacheHitRate: string
    tesseractSuccessRate: string
    openaiUsageRate: string
  }
}

export default function OCRStatsPanel() {
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState<OCRStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchStats = async () => {
    if (!isAuthenticated) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/ocr-stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setLastUpdated(new Date(data.timestamp).toLocaleString('ko-KR'))
      } else {
        setError(data.error || 'Failed to load stats')
      }
    } catch (err) {
      setError('Failed to fetch OCR stats')
      console.error('OCR stats fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    if (!isAuthenticated || !confirm('정말로 OCR 캐시를 삭제하시겠습니까?')) return
    
    try {
      const response = await fetch('/api/ocr-stats', { method: 'DELETE' })
      const data = await response.json()
      
      if (data.success) {
        alert('캐시가 성공적으로 삭제되었습니다.')
        fetchStats() // 통계 새로고침
      } else {
        alert(`캐시 삭제 실패: ${data.error}`)
      }
    } catch (err) {
      alert('캐시 삭제 중 오류가 발생했습니다.')
      console.error('Cache clear error:', err)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">🤖 Smart OCR 시스템 통계</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '🔄' : '새로고침'}
          </button>
          <button
            onClick={clearCache}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            🧹 캐시 삭제
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ⚠️ {error}
        </div>
      )}

      {lastUpdated && (
        <div className="text-sm text-gray-500 mb-4">
          마지막 업데이트: {lastUpdated}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 캐시 정보 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">💾 캐시 현황</h3>
            <div className="text-sm space-y-1">
              <div>총 항목: <span className="font-bold">{stats.cache.totalEntries}</span></div>
              <div>무료 (Tesseract): <span className="font-bold text-green-600">{stats.cache.tesseractEntries}</span></div>
              <div>유료 (OpenAI): <span className="font-bold text-orange-600">{stats.cache.openaiEntries}</span></div>
              {stats.cache.oldestEntryHours > 0 && (
                <div className="text-xs text-gray-500 mt-2">
                  가장 오래된 항목: {stats.cache.oldestEntryHours}시간 전
                </div>
              )}
            </div>
          </div>

          {/* 성능 지표 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">🎯 성능 지표</h3>
            <div className="text-sm space-y-1">
              <div>총 요청: <span className="font-bold">{stats.performance.totalRequests}</span></div>
              <div>무료 처리: <span className="font-bold text-green-600">{stats.performance.freeRequests}</span></div>
              <div>유료 처리: <span className="font-bold text-red-600">{stats.performance.paidRequests}</span></div>
              <div className="mt-2">
                <div className="text-xs text-gray-600">무료 비율</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.performance.freeRatio}%` }}
                  ></div>
                </div>
                <div className="text-xs text-center mt-1 font-bold text-green-600">
                  {stats.performance.freeRatio}%
                </div>
              </div>
            </div>
          </div>

          {/* 비용 절약 */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">💰 비용 절약</h3>
            <div className="text-sm space-y-1">
              <div>절약된 금액: <span className="font-bold text-green-600">{stats.cost.savedMoney}</span></div>
              <div>실제 지출: <span className="font-bold text-red-600">{stats.cost.spentMoney}</span></div>
              <div className="text-xs text-gray-500 mt-2">
                최적화 없이 예상 비용: {stats.cost.totalCostWithoutOptimization}
              </div>
              <div className="mt-2 p-2 bg-green-100 rounded text-center">
                <div className="text-lg font-bold text-green-700">
                  {stats.cost.savingsPercent}% 절약!
                </div>
              </div>
            </div>
          </div>

          {/* 효율성 */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">📊 효율성</h3>
            <div className="text-sm space-y-2">
              <div>
                <div className="text-xs text-gray-600">캐시 적중률</div>
                <div className="font-bold text-blue-600">{stats.efficiency.cacheHitRate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Tesseract 성공률</div>
                <div className="font-bold text-green-600">{stats.efficiency.tesseractSuccessRate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">OpenAI 사용률</div>
                <div className="font-bold text-orange-600">{stats.efficiency.openaiUsageRate}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 시스템 설명 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">🛠️ Smart OCR 시스템 작동 방식</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <div>1️⃣ <strong>이미지 최적화:</strong> 업로드 이미지를 1024x1024로 리사이징하여 토큰 비용 절약</div>
          <div>2️⃣ <strong>캐시 확인:</strong> 동일한 이미지는 24시간 캐시된 결과 재사용</div>
          <div>3️⃣ <strong>Tesseract OCR:</strong> 무료 OCR로 한글 텍스트 추출 시도</div>
          <div>4️⃣ <strong>OpenAI 번역:</strong> Tesseract 성공 시 저렴한 번역 모델로 번역</div>
          <div>5️⃣ <strong>OpenAI Vision:</strong> Tesseract 실패 시 Vision API로 OCR + 번역 동시 처리</div>
          <div className="mt-2 text-xs text-green-600">
            💡 한국 밈/슬랭 특화 번역으로 정확도 향상 + 최대 70% 비용 절약!
          </div>
        </div>
      </div>
    </div>
  )
} 