#!/usr/bin/env node
/**
 * docs/virtua_fighter_ranks.html 에서 랭크(단위) 데이터를 추출해
 * src/data/virtua-fighter-ranks.ts 로 출력합니다.
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const htmlPath = join(root, "docs", "virtua_fighter_ranks.html");
const outPath = join(root, "src", "data", "virtua-fighter-ranks.ts");

const html = readFileSync(htmlPath, "utf-8");

// Lv.46, Lv.45, ... Lv.1 순서로 레벨 추출
const levelMatches = [...html.matchAll(/Lv\.(\d+)/g)];
const levels = levelMatches.map((m) => parseInt(m[1], 10));

// badge-text span 안의 텍스트만 추출 (한/일/영 순서로 각 행마다 3개. 줄바꿈 있음/없음 둘 다)
const namePattern = /badge-text[^>]*>\s*\n?\s*([^\n<]+)/g;
const nameMatches = [...html.matchAll(namePattern)];
const names = nameMatches.map((m) => m[1].trim());

if (names.length !== levels.length * 3) {
  console.warn(
    `Expected ${levels.length * 3} names, got ${names.length}. Check HTML structure.`
  );
}

const ranks = levels.map((level, i) => ({
  level,
  ko: names[i * 3] ?? "",
  ja: names[i * 3 + 1] ?? "",
  en: names[i * 3 + 2] ?? "",
}));

const tsContent = `/**
 * Virtua Fighter 랭크(단위) 데이터
 * 출처: docs/virtua_fighter_ranks.html
 */
export interface VFRank {
  level: number;
  ko: string;
  ja: string;
  en: string;
}

export const VF_RANKS: VFRank[] = ${JSON.stringify(ranks, null, 2)};

/** level(1~46)으로 랭크 찾기 */
export function getRankByLevel(level: number): VFRank | undefined {
  return VF_RANKS.find((r) => r.level === level);
}

/** locale에 맞는 랭크 이름 반환 */
export function getRankLabel(rank: VFRank, locale: string): string {
  if (locale === "ja") return rank.ja;
  if (locale === "en") return rank.en;
  return rank.ko;
}
`;

writeFileSync(outPath, tsContent, "utf-8");
console.log(`Wrote ${outPath} (${ranks.length} ranks)`);
