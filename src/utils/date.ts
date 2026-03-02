export function formatRelativeTime(
  dateStr: string,
  t: (key: string) => string
): string {
  const now = Date.now();
  const diffMs = now - new Date(dateStr).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return t('notification.timeAgo.justNow');
  if (diffMin < 60) return `${diffMin}${t('notification.timeAgo.minutesAgo')}`;
  if (diffHour < 24) return `${diffHour}${t('notification.timeAgo.hoursAgo')}`;
  return `${diffDay}${t('notification.timeAgo.daysAgo')}`;
}

export function formatDate(dateStr: string, locale: string): string {
  const formatted = new Date(dateStr).toLocaleDateString(locale);
  if (locale === 'ko') {
    return formatted.replace(/\./g, '/').replace(/\s/g, '').replace(/\/$/, '');
  }
  return formatted;
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('ko', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}
