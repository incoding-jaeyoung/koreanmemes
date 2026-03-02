import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// 지원하는 언어 목록
export const locales = ['ko', 'en', 'ja'];

export default getRequestConfig(async ({requestLocale}) => {
  const locale = (await requestLocale) ?? 'ko';
  // 언어 검증
  if (!locales.includes(locale as any)) notFound();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
