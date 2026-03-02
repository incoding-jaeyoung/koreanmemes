"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="py-8 px-6 border-t border-white/10 text-center text-sm text-neutral-500">
      <p className="opacity-50 mb-3">{t('footer.copyright')}</p>
      <div className="flex justify-center items-center gap-3">
        <Link href="/terms" className="text-xs text-neutral-500 opacity-50 hover:opacity-100 hover:text-neutral-300 transition-all">
          {t('legal.terms.title1')}{t('legal.terms.title2')}
        </Link>
        <span className="text-xs text-neutral-700 opacity-50">|</span>
        <Link href="/privacy" className="text-xs text-neutral-500 opacity-50 hover:opacity-100 hover:text-neutral-300 transition-all">
          {t('legal.privacy.title1')}{t('legal.privacy.title2')}
        </Link>
      </div>
    </footer>
  );
}
