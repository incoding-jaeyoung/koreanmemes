"use client";

import { useState, useEffect, useMemo } from "react";
import { Globe, MessageSquare } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { useLanguage } from "@/context/LanguageContext";

// 모듈 레벨 메모리 캐시 — 세션 내 재방문 시 API 재호출 없이 즉시 표시
// key: `${postId}:${lang}` → {commentId: translatedText}
const _commentTranslationCache = new Map<string, Record<string, string>>();

// 댓글 텍스트가 특정 언어로 작성되었는지 간단히 감지
function detectLanguage(text: string): 'ko' | 'ja' | 'en' | 'unknown' {
  const trimmed = text.trim();
  if (!trimmed) return 'unknown';

  // 한글 감지 (한글 음절 유니코드 범위: AC00-D7A3)
  const koreanChars = trimmed.match(/[\uAC00-\uD7A3]/g);
  if (koreanChars && koreanChars.length / trimmed.length > 0.3) return 'ko';

  // 일본어 감지 (히라가나, 가타카나, 한자)
  const japaneseChars = trimmed.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g);
  if (japaneseChars && japaneseChars.length / trimmed.length > 0.3) return 'ja';

  // 기본값은 영어로 간주
  return 'en';
}

interface CommentListProps {
  postId: string;
  onCommentChange?: () => void;
}

type TranslationState = 'idle' | 'translating' | 'done' | 'failed';

export default function CommentList({ postId, onCommentChange }: CommentListProps) {
  const { t, locale } = useLanguage();
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // 댓글 번역 상태
  const [translationsMap, setTranslationsMap] = useState<Record<string, string>>({});
  const [translationState, setTranslationState] = useState<TranslationState>('idle');
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    checkUser();
    fetchComments(locale);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // 언어 변경 시 캐시 초기화 후 재번역
  useEffect(() => {
    setShowOriginal(false);
    setTranslationsMap({});
    setTranslationState('idle');
    if (comments.length > 0) {
      applyTranslations(comments, locale);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const checkUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setUserRole(profile?.role || 'user');
    }
  };

  const fetchComments = async (targetLocale: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        const commentList = data.comments || [];
        setComments(commentList);
        setIsLoading(false); // 댓글 즉시 표시
        if (onCommentChange) onCommentChange();
        // 번역은 로딩 완료 후 백그라운드 처리 (await 없이)
        applyTranslations(commentList, targetLocale);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setIsLoading(false);
    }
  };

  // 번역 처리: DB 번역 즉시 표시 → 미번역분만 API 호출
  const applyTranslations = async (commentList: any[], targetLocale: string) => {
    if (commentList.length === 0) return;

    const cacheKey = `${postId}:${targetLocale}`;

    // 1순위: 모듈 메모리 캐시 (세션 내 재방문)
    const memCached = _commentTranslationCache.get(cacheKey);
    if (memCached) {
      setTranslationsMap(memCached);
      setTranslationState('done');
      return;
    }

    // 2순위: 댓글 목록 응답에 포함된 DB 번역 즉시 추출
    const dbTranslations: Record<string, string> = {};
    commentList.forEach((c: any) => {
      const tr = (c.comment_translations as { lang: string; content: string }[] | undefined)
        ?.find(t => t.lang === targetLocale && t.content);
      if (tr) dbTranslations[c.id] = tr.content;
    });

    // DB 번역 즉시 표시 (API 호출 전에 먼저 렌더)
    if (Object.keys(dbTranslations).length > 0) {
      setTranslationsMap(dbTranslations);
      setTranslationState('done');
    }

    // 미번역 댓글 확인 (단, 이미 사용자 언어로 작성된 댓글은 제외)
    const untranslatedIds = commentList
      .filter((c: any) => {
        // 이미 DB 번역이 있으면 스킵
        if (dbTranslations[c.id]) return false;

        // 댓글 언어 감지
        const detectedLang = detectLanguage(c.content || '');

        // 댓글 언어와 사용자 언어가 같으면 번역 불필요
        if (detectedLang === targetLocale) return false;

        return true;
      })
      .map((c: any) => c.id);

    if (untranslatedIds.length === 0) {
      if (Object.keys(dbTranslations).length > 0) {
        _commentTranslationCache.set(cacheKey, dbTranslations);
      } else {
        setTranslationState('idle');
      }
      return;
    }

    // 3순위: 미번역분만 Gemini API 호출
    setTranslationState('translating');
    try {
      const res = await fetch(`/api/posts/${postId}/comments/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentIds: untranslatedIds, targetLang: targetLocale }),
      });

      if (!res.ok) {
        console.warn('[comment translate] API error:', res.status);
        if (Object.keys(dbTranslations).length > 0) {
          _commentTranslationCache.set(cacheKey, dbTranslations);
          setTranslationState('done');
        } else {
          setTranslationState('failed');
        }
        return;
      }

      const data = await res.json();
      const merged = { ...dbTranslations, ...(data.translations ?? {}) };

      if (Object.keys(merged).length > 0) {
        _commentTranslationCache.set(cacheKey, merged);
        setTranslationsMap(merged);
        setTranslationState('done');
      } else {
        setTranslationState('idle');
      }
    } catch (err) {
      console.warn('[comment translate] Fetch error:', err);
      if (Object.keys(dbTranslations).length > 0) {
        _commentTranslationCache.set(cacheKey, dbTranslations);
        setTranslationState('done');
      } else {
        setTranslationState('failed');
      }
    }
  };

  // 수동 재시도
  const handleRetry = () => {
    const cacheKey = `${postId}:${locale}`;
    _commentTranslationCache.delete(cacheKey);
    setTranslationsMap({});
    setTranslationState('idle');
    applyTranslations(comments, locale);
  };

  // 댓글 새로고침 (새 댓글 포함 재번역)
  const handleRefresh = async () => {
    const cacheKey = `${postId}:${locale}`;
    _commentTranslationCache.delete(cacheKey);
    setTranslationsMap({});
    setTranslationState('idle');
    await fetchComments(locale);
  };

  // 댓글 트리 구조 생성 (parentAuthorName 포함)
  const buildCommentTree = (comments: any[]) => {
    const commentMap: { [key: string]: any } = {};
    const roots: any[] = [];

    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, children: [], parentAuthorName: undefined };
    });

    comments.forEach(comment => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        // reply_to_comment_id가 있으면 실제 답글 대상, 없으면 parent(루트) 작성자
        const replyTarget = comment.reply_to_comment_id
          ? commentMap[comment.reply_to_comment_id]
          : commentMap[comment.parent_id];
        commentMap[comment.id].parentAuthorName = replyTarget?.author_name;
        commentMap[comment.parent_id].children.push(commentMap[comment.id]);
      } else {
        roots.push(commentMap[comment.id]);
      }
    });

    return roots;
  };

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  // 재귀적으로 댓글 렌더링
  const renderComments = (nodes: any[], isTopLevel = true) => {
    // 숨길 노드 필터링:
    // - 대댓글(비루트) 삭제 → 항상 숨김
    // - 루트 댓글 삭제 → 활성 대댓글이 없으면 숨김, 있으면 플레이스홀더 표시
    const visibleNodes = nodes.filter(node => {
      if (!node.is_deleted) return true;
      if (!isTopLevel) return false;
      return node.children.some((c: any) => !c.is_deleted);
    });

    return visibleNodes.map((node, index) => {
      const activeChildren = node.children.filter((c: any) => !c.is_deleted);
      return (
        <div key={node.id} className={`mb-5 ${isTopLevel && index > 0 ? 'pt-5 border-t border-white/20' : ''}`}>
          <CommentItem
            comment={node}
            currentUserId={user?.id}
            currentUserRole={userRole}
            onRefresh={handleRefresh}
            translatedContent={showOriginal ? undefined : translationsMap[node.id]}
            parentAuthorName={node.parentAuthorName}
          />
          {activeChildren.length > 0 && (
            <div>
              {renderComments(activeChildren, false)}
            </div>
          )}
        </div>
      );
    });
  };

  if (isLoading) {
    return <div className="py-10 text-center text-neutral-500">{t('Comments.loading')}</div>;
  }

  return (
    <div className="mt-16">
      <h3 className="flex gap-2 items-center mb-4 text-lg font-black tracking-widest uppercase text-neutral-400">
        <MessageSquare className="w-5 h-5 text-brand-yellow" />
        {t('Comments.title')} <span className="text-brand-yellow">{comments.filter(c => !c.is_deleted).length}</span>
      </h3>

      {/* 댓글 번역 상태 바 */}
      {translationState !== 'idle' && (
        <div className={`flex items-center justify-between text-sm rounded-lg px-3 py-2 mb-4 transition-all duration-300 ${
          translationState === 'translating'
            ? 'bg-brand-blue/10 border border-brand-blue/30 text-brand-blue'
            : translationState === 'failed'
            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
            : 'text-neutral-500'
        }`}>
          <span className="flex gap-2 items-center font-medium">
            <Globe className={`w-3.5 h-3.5 shrink-0 ${translationState === 'translating' ? 'animate-spin' : ''}`} />
            {translationState === 'translating' ? (
              <span className="flex flex-col gap-0.5">
                <span>{t('Comments.translating')}</span>
                <span className="font-normal opacity-60">{t('Comments.translating_hint')}</span>
              </span>
            ) : translationState === 'failed' ? (
              <span className="flex gap-2 items-center">
                <span>{t('Comments.translation_failed')}</span>
                <button
                  onClick={handleRetry}
                  className="underline transition-opacity underline-offset-2 hover:opacity-80"
                >
                  {t('Comments.retry_translation')}
                </button>
              </span>
            ) : (
              <span className="flex gap-1 items-center">
                <span className="opacity-60">AI</span>
                <span className="opacity-40">·</span>
                <span className="opacity-60">{locale.toUpperCase()}</span>
              </span>
            )}
            {translationState === 'translating' && (
              <span className="flex gap-1 ml-1">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="w-1 h-1 rounded-full animate-bounce bg-brand-blue"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
            )}
          </span>
          {translationState === 'done' && (
            <button
              onClick={() => setShowOriginal(prev => !prev)}
              className="font-semibold transition-colors hover:text-brand-yellow shrink-0"
            >
              {showOriginal ? t('board.detail.view_translated') : t('board.detail.view_original')}
            </button>
          )}
        </div>
      )}

      <div className="mt-8">
        {comments.length === 0 ? (
          <p className="py-8 text-sm text-center text-neutral-500">{t('Comments.firstComment')}</p>
        ) : (
          renderComments(commentTree)
        )}
      </div>

      {user ? (
        <div className="mt-12">
          <h3 className="text-xl font-black tracking-tighter mb-4">
            {t('Comments.writeTitlePre')} <span className="text-brand-yellow">{t('Comments.writeTitleAccent')}</span>
          </h3>
          <CommentForm postId={postId} onSuccess={handleRefresh} />
        </div>
      ) : (
        <div className="bg-white/[0.03] rounded-xl p-8 text-center text-sm text-neutral-400 mt-6 border border-white/5">
          {t('Comments.loginRequired')} <button
            onClick={() => {
              const currentPath = window.location.pathname;
              window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
            }}
            className="font-bold cursor-pointer text-brand-yellow hover:underline"
          >{t('Comments.loginLink')}</button>{t('Comments.loginRequiredSuffix')}
        </div>
      )}
    </div>
  );
}
