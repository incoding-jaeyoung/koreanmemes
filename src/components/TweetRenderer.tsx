"use client";

import { useEffect, useState, useRef } from "react";
import { injectVideoPoster } from "@/utils/thumbnail";

/**
 * HTML 콘텐츠에서 트윗 임베드를 찾아서 Twitter oEmbed로 렌더링
 */
export default function TweetRenderer({ htmlContent }: { htmlContent: string }) {
  const [processedContent, setProcessedContent] = useState(htmlContent);
  const containerRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef<string>("");
  const lastRenderedRef = useRef<string>("");

  useEffect(() => {
    if (processedRef.current === htmlContent) return;

    if (!htmlContent.includes('tweet-embed')) {
      setProcessedContent(injectVideoPoster(htmlContent));
      processedRef.current = htmlContent;
      return;
    }

    async function processTweets() {
      let content = htmlContent;
      const regex = /<div class="tweet-embed" data-tweet-url="([^"]+)"[^>]*><\/div>/g;
      const matches = [...htmlContent.matchAll(regex)];

      if (matches.length === 0) {
        processedRef.current = htmlContent;
        return;
      }

      // 1) 모든 트윗을 스켈레톤으로 한 번에 교체 (한 블록만 매칭되도록 단일 자식 div 사용)
      const placeholders: { placeholder: string; url: string }[] = [];
      matches.forEach((match, i) => {
        const url = match[1];
        const tweetId = `tweet-loading-${Date.now()}-${i}`;
        const skeleton = `<div class="tweet-skeleton" data-tweet-id="${tweetId}" data-tweet-url="${url.replace(/"/g, "&quot;")}" style="max-width: 550px; margin: 1.5rem auto; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.05);"><div class="tweet-skeleton-inner" style="height: 200px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); font-size: 0.875rem;">트윗 로딩 중...</div></div>`;
        content = content.replace(match[0], skeleton);
        placeholders.push({ placeholder: tweetId, url });
      });
      setProcessedContent(content);

      // 2) 모든 트윗을 병렬로 로드
      const TIMEOUT_MS = 10000;
      const results = await Promise.all(
        placeholders.map(async ({ placeholder, url }) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
            const response = await fetch(
              `/api/twitter/oembed?url=${encodeURIComponent(url)}`,
              { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            if (!data?.html) throw new Error('No HTML in response');
            return { placeholder, html: data.html, url };
          } catch (err) {
            return { placeholder, html: null, url };
          }
        })
      );

      // 3) 스켈레톤을 실제 HTML 또는 fallback으로 한 번에 교체
      results.forEach(({ placeholder, html, url }) => {
        const skeletonRegex = new RegExp(
          `<div class="tweet-skeleton" data-tweet-id="${placeholder}"[^>]*><div class="tweet-skeleton-inner"[^>]*>[\\s\\S]*?</div></div>`,
          "g"
        );
        const replacement =
          html ||
          `<div style="max-width: 550px; margin: 1.5rem auto; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.05); text-align: center;"><p style="color: rgba(255,255,255,0.6); margin-bottom: 1rem; font-size: 0.875rem;">트윗을 불러올 수 없습니다</p><a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.5rem 1rem; background: rgba(29, 155, 240, 0.1); color: rgb(29, 155, 240); border: 1px solid rgba(29, 155, 240, 0.3); border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.875rem;">🐦 X에서 보기</a></div>`;
        content = content.replace(skeletonRegex, replacement);
      });

      setProcessedContent(injectVideoPoster(content));
      processedRef.current = htmlContent;
    }

    processTweets();
  }, [htmlContent]);

  useEffect(() => {
    if (!containerRef.current || !processedContent.includes('twitter-tweet')) return;

    const loadTwitterWidget = () => {
      // Twitter 위젯 스크립트가 이미 로드되었는지 확인
      if ((window as any).twttr?.widgets) {
        // 이미 로드되었으면 해당 컨테이너만 다시 렌더링
        (window as any).twttr.widgets.load(containerRef.current);
      } else {
        // 스크립트가 없으면 추가 (한 번만 추가되도록 확인)
        if (!document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://platform.twitter.com/widgets.js';
          script.async = true;
          script.charset = 'utf-8';
          script.onload = () => {
            // 스크립트 로드 완료 후 위젯 렌더링
            if ((window as any).twttr?.widgets && containerRef.current) {
              (window as any).twttr.widgets.load(containerRef.current);
            }
          };
          document.body.appendChild(script);
        }
      }
    };

    // Twitter 위젯 로딩을 약간 지연시켜 DOM이 완전히 업데이트된 후 실행
    const timeoutId = setTimeout(loadTwitterWidget, 200);
    return () => clearTimeout(timeoutId);
  }, [processedContent]);

  // 새로고침/리렌더 시 같은 content로 innerHTML을 다시 넣지 않음 (Twitter가 주입한 iframe이 사라지는 것 방지)
  useEffect(() => {
    if (!containerRef.current || processedContent === lastRenderedRef.current) return;
    lastRenderedRef.current = processedContent;
    containerRef.current.innerHTML = processedContent;
  }, [processedContent]);

  return (
    <div
      ref={containerRef}
      className="prose prose-invert max-w-none text-white"
      suppressHydrationWarning
    />
  );
}
