import { MetadataRoute } from 'next'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'http://localhost:3000'

  // 정적 페이지들
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/write`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // 동적 게시물 페이지들
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        updatedAt: true,
        category: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    const postPages = posts.map((post) => ({
      url: `${baseUrl}/post/${post.id}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // 카테고리 페이지들
    const categories = ['HUMOR', 'CULTURE', 'DRAMA', 'LIFESTYLE', 'TECH', 'GENERAL']
    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/category/${category.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...postPages, ...categoryPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
} 