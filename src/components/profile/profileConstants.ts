export const LANGUAGES = [
  { code: "ko", flag: "\u{1F1F0}\u{1F1F7}", name: "\uD55C\uAD6D\uC5B4" },
  { code: "en", flag: "\u{1F1FA}\u{1F1F8}", name: "English" },
  { code: "ja", flag: "\u{1F1EF}\u{1F1F5}", name: "\u65E5\u672C\u8A9E" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
