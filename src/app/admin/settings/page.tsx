"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Globe, Info, CheckCircle2, AlertCircle } from "lucide-react";

type Locale = "ko" | "en" | "ja";

interface HeroContent {
  tag: string;
  title: string;
  desc: string;
  enter: string;
  frame: string;
}

interface SiteSettings {
  [key: string]: {
    ko: HeroContent;
    en: HeroContent;
    ja: HeroContent;
  };
}

export default function AdminSettings() {
  const [activeLocale, setActiveLocale] = useState<Locale>("ko");
  const [heroContent, setHeroContent] = useState<SiteSettings["hero_content"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const DEFAULT_HERO_CONTENT: SiteSettings["hero_content"] = {
    ko: { tag: "차세대 격투 게임", title: "VIRTUA FIGHTER 6", desc: "버추어 파이터의 새로운 시대가 지금 시작됩니다.", enter: "커뮤니티 입장", frame: "프레임표 보기" },
    en: { tag: "NEXT GEN FIGHTING", title: "VIRTUA FIGHTER 6", desc: "A new era of Virtua Fighter begins now.", enter: "Enter Community", frame: "View Frame Data" },
    ja: { tag: "次世代格闘ゲーム", title: "バーチャファイター 6", desc: "バーチャファイターの新時代이 지금 시작됩니다.", enter: "コミュニティに入る", frame: "フレーム表を見る" }
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.hero_content) {
          setHeroContent(data.hero_content);
        } else {
          // 데이터가 없으면 기본값 설정
          setHeroContent(DEFAULT_HERO_CONTENT);
        }
      } else {
        // API 에러 시에도 기본값으로 시도할 수 있게 함
        setHeroContent(DEFAULT_HERO_CONTENT);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setHeroContent(DEFAULT_HERO_CONTENT);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (field: keyof HeroContent, value: string) => {
    if (!heroContent) return;
    setHeroContent({
      ...heroContent,
      [activeLocale]: {
        ...heroContent[activeLocale],
        [field]: value
      }
    });
  };

  const saveSettings = async () => {
    if (!heroContent) return;
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "hero_content",
          value: heroContent
        })
      });

      if (response.ok) {
        setMessage({ type: "success", text: "설정이 성공적으로 저장되었습니다!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("저장에 실패했습니다.");
      }
    } catch (error) {
      setMessage({ type: "error", text: "저장 중 오류가 발생했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  if (!heroContent) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white mb-2">사이트 설정 (CMS)</h2>
          <p className="text-neutral-400">메인 페이지의 콘텐츠를 다국어별로 동적으로 관리합니다.</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-yellow text-black font-black italic rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>설정 저장하기</span>
        </button>
      </div>

      {/* Message Notifications */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${
              message.type === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-brand-red/10 text-brand-red border border-brand-red/20"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form Area */}
      <div className="glass-card border-white/5 overflow-hidden">
        {/* Language Tabs */}
        <div className="flex border-b border-white/5 bg-white/[0.02]">
          {(["ko", "en", "ja"] as Locale[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLocale(lang)}
              className={`flex-1 py-4 text-xs font-black tracking-widest uppercase transition-all border-b-2 ${
                activeLocale === lang 
                  ? "border-brand-yellow text-brand-yellow bg-brand-yellow/5" 
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {lang === "ko" ? "한국어 (KO)" : lang === "en" ? "ENGLISH (EN)" : "日本語 (JA)"}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tag */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                히어로 태그
                <Info className="w-3 h-3 text-neutral-600" />
              </label>
              <input
                type="text"
                value={heroContent[activeLocale].tag}
                onChange={(e) => handleUpdate("tag", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-brand-yellow/50 transition-colors text-white outline-none"
                placeholder="예: 차세대 격투 게임"
              />
            </div>

            {/* Title */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">히어로 타이틀</label>
              <input
                type="text"
                value={heroContent[activeLocale].title}
                onChange={(e) => handleUpdate("title", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-brand-yellow/50 transition-colors text-white outline-none text-xl font-bold italic"
                placeholder="예: 궁극의 투쟁이 시작된다"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">히어로 설명문</label>
              <textarea
                rows={3}
                value={heroContent[activeLocale].desc}
                onChange={(e) => handleUpdate("desc", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-brand-yellow/50 transition-colors text-white outline-none resize-none"
                placeholder="메인 페이지의 상세 설명을 입력하세요"
              />
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">메인 버튼 텍스트</label>
              <input
                type="text"
                value={heroContent[activeLocale].enter}
                onChange={(e) => handleUpdate("enter", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-brand-yellow/50 transition-colors text-white outline-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">보조 버튼 텍스트</label>
              <input
                type="text"
                value={heroContent[activeLocale].frame}
                onChange={(e) => handleUpdate("frame", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-brand-yellow/50 transition-colors text-white outline-none font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="glass-card border-brand-yellow/10 bg-brand-yellow/[0.02] p-6 flex items-start gap-4">
        <Globe className="w-6 h-6 text-brand-yellow shrink-0" />
        <div>
          <h4 className="font-bold text-white mb-1">실시간 반영 알림</h4>
          <p className="text-sm text-neutral-400">
            저장 버튼을 누르는 즉시 메인 페이지에 내용이 반영됩니다. 각 언어별 탭으로 이동하여 모든 언어의 설정을 확인한 후 저장해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
