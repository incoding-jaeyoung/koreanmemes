"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MessageSquare, User, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/utils/date";

export default function RecentCommentsWidget() {
  const { t, locale } = useLanguage();
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRecentComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*, post:posts(title), comment_translations(lang, content)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (data) setComments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentComments();
  }, []);

  if (isLoading) return (
    <div className="bg-white/5 rounded-xl h-[200px]" />
  );
  
  if (comments.length === 0) return null;

  return (
    <div className="glass-card rounded-xl border border-white/10 backdrop-blur-xl bg-black/40 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <h3 className="font-bold text-sm text-neutral-300 flex items-center gap-2 uppercase tracking-wide">
          <MessageSquare className="w-3.5 h-3.5 text-brand-yellow" />
          {t('widget.comments.title')}
        </h3>
      </div>
      <div className="divide-y divide-white/5">
        {comments.map((comment) => (
          <Link 
            key={comment.id} 
            href={`/board/${comment.post_id}`}
            className="block px-5 py-3 hover:bg-white/5 transition-all group"
          >
            <div className="space-y-1.5">
              <p className="text-sm text-neutral-300 line-clamp-2 group-hover:text-white transition-colors font-bold">
                {(comment.comment_translations as { lang: string; content: string }[] | undefined)?.find(tr => tr.lang === locale)?.content || comment.content}
              </p>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-bold text-neutral-400 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {comment.author_name}
                </span>
                <span className="text-[10px]">
                  {formatDate(comment.created_at, locale)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
