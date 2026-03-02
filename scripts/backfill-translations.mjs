/**
 * 기존 게시글 일괄 번역 스크립트
 * 실행: node scripts/backfill-translations.mjs
 *
 * - post_translations가 없는 글만 대상
 * - Gemini 1.5 Flash로 ko/en/ja 번역
 * - API 호출 간격: 500ms (rate limit 대응)
 */

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GEMINI_API_KEY) {
  console.error('❌ 환경변수 누락:', { SUPABASE_URL: !!SUPABASE_URL, SUPABASE_SERVICE_KEY: !!SUPABASE_SERVICE_KEY, GEMINI_API_KEY: !!GEMINI_API_KEY });
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction:
    "You are a specialized translator for the 'Virtua Fighter' game community. " +
    'Translate the gaming terminology accurately. ' +
    'Output MUST be a clean JSON object mapping language codes to translated text. ' +
    'Example: {"en": "...", "ja": "..."}. ' +
    'Do NOT include markdown code fences or any extra text.',
});

const ALL_LANGS = ['ko', 'en', 'ja'];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function translateTitle(text, targetLangs) {
  const stripped = text?.trim().replace(/\s/g, '');
  if (!stripped || stripped.length <= 2 || targetLangs.length === 0) return {};
  const prompt = `Translate the following title into these languages: ${targetLangs.join(', ')}.\nTitle: "${text.trim()}"`;
  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned);
}

async function main() {
  // 번역이 하나도 없는 post_id 목록 조회
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, language')
    .order('created_at', { ascending: true });

  if (error) { console.error('❌ posts 조회 실패:', error); process.exit(1); }

  // 이미 번역된 post_id 목록
  const { data: existing } = await supabase
    .from('post_translations')
    .select('post_id');
  const translatedIds = new Set((existing || []).map(r => r.post_id));

  const targets = posts.filter(p => !translatedIds.has(p.id));
  console.log(`📋 전체 ${posts.length}개 중 번역 필요: ${targets.length}개`);

  let success = 0;
  let failed = 0;

  for (const post of targets) {
    const originalLang = ALL_LANGS.includes(post.language) ? post.language : 'ko';
    const targetLangs = ALL_LANGS.filter(l => l !== originalLang);

    process.stdout.write(`  [${success + failed + 1}/${targets.length}] "${post.title.slice(0, 30)}" → `);

    try {
      const translations = await translateTitle(post.title, targetLangs);
      const rows = Object.entries(translations)
        .filter(([, t]) => !!t)
        .map(([lang, title]) => ({ post_id: post.id, lang, title }));

      if (rows.length > 0) {
        const { error: insErr } = await supabase.from('post_translations').insert(rows);
        if (insErr) throw insErr;
      }
      console.log(`✅ ${rows.map(r => r.lang).join(', ')}`);
      success++;
    } catch (err) {
      console.log(`❌ 실패: ${err.message}`);
      failed++;
    }

    await sleep(500);
  }

  console.log(`\n완료: 성공 ${success}개 / 실패 ${failed}개`);
}

main();
