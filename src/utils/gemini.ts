import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPPORTED_LANGS = ['ko', 'en', 'ja'] as const;
export type SupportedLang = typeof SUPPORTED_LANGS[number];

/** 번역 최소 길이: 공백 제거 후 이 글자 수 이하면 번역 스킵 */
const MIN_TRANSLATE_LENGTH = 2;

/** 본문 번역 최소 길이: HTML 제거 후 텍스트가 이 글자 수 이하면 번역 스킵 */
const MIN_CONTENT_LENGTH = 5;

/** 댓글 번역 최소 길이: 이 글자 수 이하면 번역 스킵 (단일 이모지/감탄사 제외) */
const MIN_COMMENT_LENGTH = 2;

/** 본문 번역 모델 — 더 저렴한 모델 사용 시 'gemini-2.0-flash-lite'로 변경 */
const POST_TRANSLATION_MODEL = 'gemini-2.0-flash';

/** 댓글 번역 모델 — 글이 많아지면 'gemini-2.0-flash-lite'로 변경 */
const COMMENT_TRANSLATION_MODEL = 'gemini-2.0-flash';

/**
 * 번역 시 적용할 용어/지침 (특정 단어 번역 규칙).
 * 이 파일 상단의 TRANSLATION_TERMINOLOGY 에 적어두면
 * 제목·본문·댓글 모든 번역 API에 공통 적용됩니다.
 *
 * 예시:
 * - "버파" → 영어: Virtua Fighter, 일본어: バーチャファイター
 * - 캐릭터명·기술명은 원문 유지
 * - "콤보" → en: combo, ja: コンボ
 */
const TRANSLATION_TERMINOLOGY = [
  'Apply these terminology rules when translating:',
  '- Keep Virtua Fighter character names and move names in original form.',
  '- Add your own rules below (e.g. "버파" → "Virtua Fighter" in English).',
  '- "붕운장" → "Akira Special" in English and Japanese',
  '- "붕격운신쌍호장" → "Akira Special" in English and Japanese',
].join(' ');

let genAI: GoogleGenerativeAI | null = null;

/** 429 Rate Limit 시 지연 후 재시도 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 3000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const is429 = err?.message?.includes('429') || err?.status === 429;
    if (retries > 0 && is429) {
      await new Promise(r => setTimeout(r, delayMs));
      return withRetry(fn, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * 제목을 대상 언어들로 번역합니다.
 * - 원본 언어는 targetLangs에서 제외해서 호출할 것 (호출자 책임)
 *   예) 원본 ko → targetLangs: ['en', 'ja']
 *       원본 en → targetLangs: ['ko', 'ja']
 *       원본 ja → targetLangs: ['ko', 'en']
 * - 공백 제거 후 2자 이하 제목은 번역 스킵
 */
export async function translateTitle(
  text: string,
  targetLangs: SupportedLang[],
  sourceLang?: SupportedLang
): Promise<Partial<Record<SupportedLang, string>>> {
  const stripped = text?.trim().replace(/\s/g, '');
  if (!stripped || stripped.length <= MIN_TRANSLATE_LENGTH || targetLangs.length === 0) {
    return {};
  }

  const langName: Record<SupportedLang, string> = {
    ko: 'Korean',
    en: 'English',
    ja: 'Japanese',
  };

  const sourceDesc = sourceLang ? `from ${langName[sourceLang]} ` : '';

  const model = getGenAI().getGenerativeModel({
    model: POST_TRANSLATION_MODEL,
    systemInstruction:
      "You are a specialized translator for the 'Virtua Fighter' game community. " +
      'Translate the gaming terminology accurately. ' +
      (sourceLang ? `The source language is ${langName[sourceLang]} — translate ALL text even if some words appear to already be in the target language. ` : '') +
      TRANSLATION_TERMINOLOGY + ' ' +
      'Output MUST be a clean JSON object mapping language codes to translated text. ' +
      'Example: {"en": "...", "ja": "..."}. ' +
      'Do NOT include markdown code fences or any extra text.',
  });

  const prompt =
    `Translate the following title ${sourceDesc}into these languages: ${targetLangs.join(', ')}.\n` +
    `Title: "${text.trim()}"`;

  const result = await withRetry(() => model.generateContent(prompt));
  const raw = result.response.text().trim();

  // 마크다운 코드 블록 제거 (안전 처리)
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  return JSON.parse(cleaned) as Partial<Record<SupportedLang, string>>;
}

/**
 * HTML 본문을 단일 대상 언어로 번역합니다.
 *
 * 비용 최적화 전략:
 * 1. img/iframe/video 태그를 [[BLOCK_N]] 플레이스홀더로 교체 → 번역 후 복원 (토큰 절약)
 * 2. HTML 제거 후 텍스트가 MIN_CONTENT_LENGTH 이하면 번역 스킵
 * 3. 원본 언어와 targetLang이 같으면 호출하지 말 것 (호출자 책임)
 *
 * @param html HTML 형식 본문 (TipTap 에디터 출력)
 * @param targetLang 번역 대상 언어 코드
 * @returns 번역된 HTML 문자열 (플레이스홀더 복원 완료)
 */
export async function translateContent(
  html: string,
  targetLang: SupportedLang,
  sourceLang?: SupportedLang
): Promise<string | null> {
  if (!html?.trim()) return null;

  // 1. 블록 태그(img, iframe, video) 플레이스홀더 교체
  const blocks: string[] = [];
  const withPlaceholders = html.replace(
    /<(img|iframe|video|source)[^>]*\/?>/gi,
    (match) => {
      const idx = blocks.length;
      blocks.push(match);
      return `[[BLOCK_${idx}]]`;
    }
  );

  // 2. 플레이스홀더 교체 후 순수 텍스트 추출해서 최소 길이 확인
  const textOnly = withPlaceholders.replace(/<[^>]+>/g, '').trim();
  if (textOnly.length <= MIN_CONTENT_LENGTH) return null;

  const langName: Record<SupportedLang, string> = {
    ko: 'Korean',
    en: 'English',
    ja: 'Japanese',
  };

  const sourceDesc = sourceLang ? `from ${langName[sourceLang]} ` : '';

  const model = getGenAI().getGenerativeModel({
    model: POST_TRANSLATION_MODEL,
    systemInstruction:
      "You are a translator specializing in the 'Virtua Fighter' gaming community. " +
      `Translate the provided HTML content ${sourceDesc}into ${langName[targetLang]}. ` +
      (sourceLang ? `The source language is ${langName[sourceLang]} — translate ALL text even if some words look like they are already in the target language. ` : '') +
      TRANSLATION_TERMINOLOGY + ' ' +
      'CRITICAL RULES:\n' +
      '1. Preserve ALL HTML tags exactly as-is (do not modify, add, or remove any tags).\n' +
      '2. Preserve [[BLOCK_N]] placeholders exactly — do NOT translate or modify them.\n' +
      '3. Do NOT wrap output in markdown code fences.\n' +
      '4. Translate only the visible text content between HTML tags.\n' +
      '5. Keep game-specific terms (character names, move names) in their original form.',
  });

  const result = await withRetry(() =>
    model.generateContent(`Translate the following HTML ${sourceDesc}to ${langName[targetLang]}:\n\n${withPlaceholders}`)
  );
  const translated = result.response.text().trim();

  // 마크다운 코드 펜스 안전 제거
  const cleaned = translated.replace(/^```(?:html)?\n?/, '').replace(/\n?```$/, '').trim();

  // 3. 플레이스홀더 복원
  const restored = cleaned.replace(/\[\[BLOCK_(\d+)\]\]/g, (_, i) => blocks[Number(i)] ?? '');

  return restored;
}

/**
 * 댓글 배열을 대상 언어로 일괄 번역합니다.
 *
 * 비용 최적화 전략:
 * 1. MIN_COMMENT_LENGTH 이하 댓글은 스킵 (짧은 감탄사·이모지 등)
 * 2. response_mime_type: "application/json" 으로 파싱 안전성 보장
 * 3. 모델: COMMENT_TRANSLATION_MODEL (필요시 flash-lite로 교체)
 *
 * @param comments 번역할 댓글 배열 [{id, text}]
 * @param targetLang 번역 대상 언어 코드
 * @returns commentId → 번역 텍스트 맵 (스킵된 댓글은 포함 안 됨)
 */
export async function translateComments(
  comments: { id: string; text: string }[],
  targetLang: SupportedLang
): Promise<Record<string, string>> {
  // 최소 길이 필터
  const toTranslate = comments.filter(c => (c.text?.trim() ?? '').length >= MIN_COMMENT_LENGTH);
  if (toTranslate.length === 0) return {};

  const langName: Record<SupportedLang, string> = {
    ko: 'Korean',
    en: 'English',
    ja: 'Japanese',
  };

  const model = getGenAI().getGenerativeModel({
    model: COMMENT_TRANSLATION_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
    },
    systemInstruction:
      "You are a translator for the 'Virtua Fighter' fighting game community. " +
      'Translate each comment naturally, preserving the casual tone and fighting game slang. ' +
      'Detect the source language of each comment and translate it fully into the target language — ' +
      'even if some words appear to already be in the target language (e.g. kanji in a Korean comment must still be translated). ' +
      TRANSLATION_TERMINOLOGY + ' ' +
      'Keep emojis, special characters, and game-specific terms (character names, move names) unchanged. ' +
      'KOREAN HONORIFIC RULES: Korean name/username suffixes must be handled naturally — ' +
      'remove or adapt them rather than transliterating. Examples: ' +
      '"arocer님" → "arocer" (not "arocer-nim"), ' +
      '"홍길동씨" → "Gildong" (not "Gildong-ssi"), ' +
      '"친구야/아" → omit the suffix, ' +
      '"여러분" → "everyone". ' +
      'Output MUST be a JSON array: [{"id":"...","translated":"..."}, ...]. ' +
      'Include only the items provided. Do NOT add markdown or extra text.',
  });

  const prompt =
    `Translate the following comments into ${langName[targetLang]}.\n` +
    `Input JSON:\n${JSON.stringify(toTranslate.map(c => ({ id: c.id, text: c.text })))}`;

  const result = await withRetry(() => model.generateContent(prompt));
  const raw = result.response.text().trim();

  // 마크다운 코드 블록 안전 제거
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  const parsed: { id: string; translated: string }[] = JSON.parse(cleaned);

  return Object.fromEntries(parsed.map(item => [item.id, item.translated]));
}
