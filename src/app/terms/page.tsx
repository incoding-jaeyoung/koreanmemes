"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import TermsContent from "@/components/legal/TermsContent";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('common.back')}</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="text-3xl font-black tracking-tighter mb-2">
          {t('legal.terms.title1')}<span className="text-brand-yellow">{t('legal.terms.title2')}</span>
        </h1>
        <TermsContent />
      </motion.div>
    </div>
  );
}
