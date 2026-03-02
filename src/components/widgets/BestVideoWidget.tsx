"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Youtube } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getThumbnailFromContent } from "@/utils/thumbnail";

export default function BestVideoWidget() {
  const { t, locale } = useLanguage();
  const [video, setVideo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchBestVideo = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, post_translations(lang, title)')
          .eq('board_type', 'video')
          .order('likes', { ascending: false })
          .limit(1)
          .single();

        if (data) setVideo(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBestVideo();
  }, []);

  const extractVideoId = (content: string) => {
    if (!content) return null;
    const ytEmbed = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/.exec(content);
    if (ytEmbed?.[1]) return ytEmbed[1];
    const ytWatch = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/.exec(content);
    if (ytWatch?.[1]) return ytWatch[1];
    const ytShort = /youtu\.be\/([a-zA-Z0-9_-]+)/.exec(content);
    if (ytShort?.[1]) return ytShort[1];
    return null;
  };

  if (isLoading) return (
    <div className="bg-white/5 rounded-xl h-[200px]" />
  );

  if (!video) return null;

  const videoId = extractVideoId(video.content);
  const thumbnailUrl = getThumbnailFromContent(video.content, video.id);
  const isCloudinaryVideo = /res\.cloudinary\.com\/[^/]+\/video\/upload\//i.test(video.content ?? '');
  const displayTitle = (video.post_translations as { lang: string; title: string }[] | undefined)
    ?.find(tr => tr.lang === locale)?.title || video.title;

  return (
    <div className="glass-card rounded-xl border border-white/10 backdrop-blur-xl bg-black/40 overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <h3 className="font-bold text-sm text-brand-red flex items-center gap-2 uppercase tracking-wide">
          <Youtube className="w-3.5 h-3.5" />
          {t('widget.bestVideo.title')}
        </h3>
      </div>
      <div className="p-0">
        {videoId ? (
          <div className="w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
            <div className="p-4">
              <Link href={`/gallery/${video.id}`} className="group block">
                <h4 className="text-sm font-bold text-white group-hover:text-brand-yellow transition-colors line-clamp-2">
                  {displayTitle}
                </h4>
              </Link>
            </div>
          </div>
        ) : isCloudinaryVideo ? (
          <Link href={`/gallery/${video.id}`} className="group block">
            <div className="relative w-full aspect-video bg-black overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt={displayTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h4 className="text-sm font-bold text-white group-hover:text-brand-yellow transition-colors line-clamp-2">
                {displayTitle}
              </h4>
            </div>
          </Link>
        ) : (
          <div className="p-5">
            <Link href={`/gallery/${video.id}`} className="block group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center shrink-0 group-hover:bg-brand-red/20 transition-colors">
                  <Youtube className="w-4 h-4 text-brand-red" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-brand-yellow transition-colors line-clamp-2">
                  {displayTitle}
                </h4>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
