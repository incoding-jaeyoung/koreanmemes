'use client'

import Head from 'next/head'

interface SEOHeadProps {
  title: string
  description: string
  canonical?: string
  keywords?: string[]
  ogImage?: string
  twitterImage?: string
  schema?: object
}

export function SEOHead({
  title,
  description,
  canonical,
  keywords = [],
  ogImage = '/og-default.jpg',
  twitterImage = '/twitter-default.jpg',
  schema
}: SEOHeadProps) {
  const fullTitle = title.includes('Korean Memes Hub') ? title : `${title} | Korean Memes Hub`
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      {canonical && <meta property="og:url" content={canonical} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={twitterImage} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  )
} 