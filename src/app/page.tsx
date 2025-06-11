'use client'

import { CategorySection } from '@/components/CategorySection'

// JSON-LD for Organization and Website
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.koreanmemes.net/#organization',
      name: 'Korean Memes Hub',
      description: 'Platform for sharing Korean culture and humor with global audience',
      url: 'https://www.koreanmemes.net',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.koreanmemes.net/logo.png',
        width: 200,
        height: 200
      },
      sameAs: [
        'https://twitter.com/KoreanMemesHub',
        'https://www.instagram.com/koreanmemeshub'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.koreanmemes.net/#website',
      url: 'https://www.koreanmemes.net',
      name: 'Korean Memes Hub',
      description: 'Korean culture and memes sharing platform',
      publisher: {
        '@id': 'https://www.koreanmemes.net/#organization'
      },
      inLanguage: 'en-US'
    },
    {
      '@type': 'CollectionPage',
      '@id': 'https://www.koreanmemes.net/#homepage',
      url: 'https://www.koreanmemes.net',
      name: 'Korean Memes & Culture Hub - Homepage',
      description: 'Browse Korean memes, culture, and humor content',
      isPartOf: {
        '@id': 'https://www.koreanmemes.net/#website'
      },
      about: [
        {
          '@type': 'Thing',
          name: 'Korean Culture'
        },
        {
          '@type': 'Thing', 
          name: 'Korean Humor'
        },
        {
          '@type': 'Thing',
          name: 'K-Drama'
        }
      ]
    }
  ]
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="text-center py-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-8 text-white">
          <h1 className="text-4xl md:text-4xl font-bold mb-4">
            Korean Memes Hub
          </h1>
          <p className="text-xl md:text-xl mb-6 opacity-90">
            Discover & Share Korean Culture with the World
          </p>
          <p className="text-md mb-8 opacity-80 max-w-2xl mx-auto">
            From hilarious memes to cultural insights, explore Korean humor and lifestyle 
            with English translations. Join our global K-culture community!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm">🇰🇷 Korean Culture</span>
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm">😂 K-Humor</span>
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm">📺 K-Drama</span>
            <span className="bg-white/20 px-4 py-1 rounded-full text-sm">🌸 K-Lifestyle</span>
          </div>
        </section>

        {/* Categories Grid */}
        <CategorySection />
      </div>
    </>
  )
}
