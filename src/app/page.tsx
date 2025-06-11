'use client'

import { CategorySection } from '@/components/CategorySection'

export default function HomePage() {
  return (
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
  )
}
