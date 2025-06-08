import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Supabase prepared statement 충돌 해결을 위한 URL 수정
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  
  // pgbouncer 설정이 없으면 추가
  if (!url.includes('pgbouncer=true')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}pgbouncer=true&statement_cache_size=0`
  }
  
  return url
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 