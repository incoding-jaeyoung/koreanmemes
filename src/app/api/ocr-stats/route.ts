import { NextRequest, NextResponse } from 'next/server'
import { getCacheStats, clearCache } from '@/lib/smart-ocr'
import { verifyAuth } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting OCR stats...')
    
    const stats = getCacheStats()
    const now = Date.now()
    
    // 캐시 효율성 계산
    const totalRequests = stats.tesseractEntries + stats.openaiEntries
    const freeRequests = stats.tesseractEntries
    const paidRequests = stats.openaiEntries
    
    // 예상 비용 절약 계산 (1회당 3원 기준)
    const costPerRequest = 3
    const savedMoney = freeRequests * costPerRequest
    const spentMoney = paidRequests * costPerRequest
    
    // 캐시 수명 계산
    const oldestAge = stats.oldestEntry ? Math.floor((now - stats.oldestEntry) / (1000 * 60 * 60)) : 0
    const newestAge = stats.newestEntry ? Math.floor((now - stats.newestEntry) / (1000 * 60)) : 0
    
    const detailedStats = {
      cache: {
        totalEntries: stats.totalEntries,
        tesseractEntries: stats.tesseractEntries,
        openaiEntries: stats.openaiEntries,
        oldestEntryHours: oldestAge,
        newestEntryMinutes: newestAge
      },
      performance: {
        totalRequests,
        freeRequests,
        paidRequests,
        freeRatio: totalRequests > 0 ? Math.round((freeRequests / totalRequests) * 100) : 0
      },
      cost: {
        savedMoney: `${savedMoney}원`,
        spentMoney: `${spentMoney}원`,
        totalCostWithoutOptimization: `${(totalRequests * costPerRequest)}원`,
        actualCost: `${spentMoney}원`,
        savingsPercent: totalRequests > 0 ? Math.round((savedMoney / (totalRequests * costPerRequest)) * 100) : 0
      },
      efficiency: {
        cacheHitRate: `${Math.round((stats.totalEntries / Math.max(1, totalRequests + stats.totalEntries)) * 100)}%`,
        tesseractSuccessRate: `${Math.round((freeRequests / Math.max(1, totalRequests)) * 100)}%`,
        openaiUsageRate: `${Math.round((paidRequests / Math.max(1, totalRequests)) * 100)}%`
      }
    }
    
    console.log('📈 OCR Stats generated:', detailedStats)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: detailedStats
    })
    
  } catch (error) {
    console.error('💥 OCR stats error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get OCR stats'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const authResult = await verifyAuth()
    if (!authResult.isAuthenticated) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required'
      }, { status: 401 })
    }
    
    console.log('🧹 Clearing OCR cache...')
    clearCache()
    
    return NextResponse.json({
      success: true,
      message: 'OCR cache cleared successfully'
    })
    
  } catch (error) {
    console.error('💥 Cache clear error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache'
    }, { status: 500 })
  }
} 