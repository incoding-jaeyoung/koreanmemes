"use client";

import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { INPUT_BRAND_CLASS } from "@/constants/inputStyles";

interface BoardSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  /** 검색창 placeholder i18n 키 */
  placeholderKey?: string;
}

export default function BoardSearchBar({
  value,
  onChange,
  onSearch,
  onReset,
  placeholderKey = "board.search",
}: BoardSearchBarProps) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-2">
      <div className="relative flex-1 md:flex-initial">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder={t(placeholderKey)}
          aria-label={t(placeholderKey)}
          className={`${INPUT_BRAND_CLASS} md:w-64 pr-10`}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={onReset}
              aria-label={t('board.search.reset')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
            >
              ✕
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <button
        onClick={onSearch}
        aria-label={t('board.search.searchButton')}
        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors shrink-0"
      >
        <Search className="w-4 h-4" />
      </button>
    </div>
  );
}
