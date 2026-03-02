"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// watch?v=, youtu.be/, live/, shorts/ 모두 지원
const YOUTUBE_REGEX =
  /https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^&\s]*&)*v=|live\/|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})[^\s]*/;

const TWITTER_REGEX =
  /https?:\/\/(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/status\/\d+[^\s]*/;

interface YouTubeEmbedProps {
  url: string;
  videoId: string;
}

function YouTubeEmbed({ url, videoId }: YouTubeEmbedProps) {
  const { t } = useLanguage();
  const [info, setInfo] = useState<{ title?: string; thumbnail_url?: string; author_name?: string } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/youtube/oembed?url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setInfo)
      .catch(() => setFailed(true));
  }, [url]);

  if (failed) return null;

  if (playing) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden aspect-video w-full sm:max-w-sm">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      className="mt-3 flex gap-3 items-center p-3 bg-white/[0.04] border border-white/10 rounded-xl cursor-pointer hover:bg-white/[0.07] transition-colors w-full sm:max-w-sm group"
      onClick={() => setPlaying(true)}
    >
      <div className="relative shrink-0 w-24 h-[54px] rounded-lg overflow-hidden bg-black/40">
        {info?.thumbnail_url ? (
          <img src={info.thumbnail_url} alt="" className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full bg-white/10 animate-pulse" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-brand-blue/80 transition-colors">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-neutral-200 line-clamp-2 leading-snug">
          {info?.title ?? t("Comments.loadingEmbed")}
        </p>
        {info?.author_name && (
          <p className="text-xs text-neutral-500 mt-1 truncate">{info.author_name}</p>
        )}
      </div>
    </div>
  );
}

interface TwitterEmbedProps {
  url: string;
}

function TwitterEmbed({ url }: TwitterEmbedProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const renderedRef = useRef(false);

  useEffect(() => {
    fetch(`/api/twitter/oembed?url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setHtml(data?.html ?? null))
      .catch(() => setFailed(true));
  }, [url]);

  useEffect(() => {
    if (!html || !containerRef.current || renderedRef.current) return;
    renderedRef.current = true;
    containerRef.current.innerHTML = html;

    const loadWidget = () => {
      if ((window as any).twttr?.widgets) {
        (window as any).twttr.widgets.load(containerRef.current);
      } else if (!document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        script.onload = () => {
          if ((window as any).twttr?.widgets && containerRef.current) {
            (window as any).twttr.widgets.load(containerRef.current);
          }
        };
        document.body.appendChild(script);
      }
    };

    const id = setTimeout(loadWidget, 200);
    return () => clearTimeout(id);
  }, [html]);

  if (failed) {
    return (
      <div className="mt-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[rgb(29,155,240)] hover:underline"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          {t("Comments.viewOnX")}
        </a>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="mt-3 h-24 rounded-xl bg-white/[0.04] border border-white/10 animate-pulse w-full sm:max-w-sm" />
    );
  }

  return (
    <div
      ref={containerRef}
      className="mt-3 w-full sm:max-w-sm [&_.twitter-tweet]:!mx-0"
      suppressHydrationWarning
    />
  );
}

interface Props {
  text: string;
}

/**
 * 댓글 텍스트에서 YouTube/Twitter URL을 감지하여 첫 번째 URL만 임베드
 */
export default function CommentMediaEmbed({ text }: Props) {
  const youtubeMatch = text.match(YOUTUBE_REGEX);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return <YouTubeEmbed url={youtubeMatch[0]} videoId={videoId} />;
  }

  const twitterMatch = text.match(TWITTER_REGEX);
  if (twitterMatch) {
    return <TwitterEmbed url={twitterMatch[0]} />;
  }

  return null;
}
