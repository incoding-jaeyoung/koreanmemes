/**
 * 기존 게시글 HTML에 SEO 속성을 후처리로 주입합니다.
 * DB를 수정하지 않고 렌더링 시점에만 적용됩니다.
 */

/**
 * alt 속성이 없거나 빈 <img> 태그에 "[게시글 제목] 이미지 N" 형식으로 alt를 자동 주입합니다.
 * 이미 alt가 있는 이미지는 건드리지 않습니다.
 */
export function injectImageAlts(html: string, postTitle: string): string {
  let count = 0;
  return html.replace(/<img(\s[^>]*?)?(\s*\/?>)/gi, (match, attrs: string, closing: string) => {
    const safeAttrs = attrs ?? '';
    const altMatch = /\balt\s*=\s*(["'])([^"']*)\1/i.exec(safeAttrs);
    const hasNonEmptyAlt = altMatch && altMatch[2].trim() !== '';
    if (hasNonEmptyAlt) return match;

    count++;
    const alt = postTitle ? `${postTitle} 이미지 ${count}` : `이미지 ${count}`;
    const escapedAlt = alt.replace(/"/g, '&quot;');

    if (altMatch) {
      // alt=""처럼 빈 alt인 경우 교체
      return `<img${safeAttrs.replace(/\balt\s*=\s*(["'])[^"']*\1/i, `alt="${escapedAlt}"`)}${closing}`;
    }
    // alt 없는 경우 추가
    return `<img${safeAttrs} alt="${escapedAlt}"${closing}`;
  });
}

/**
 * title 속성이 없는 YouTube <iframe> 태그에 oEmbed로 가져온 title을 자동 주입합니다.
 * @param titleMap video ID → title 맵
 */
export function injectIframeTitles(
  html: string,
  titleMap: Map<string, string>
): string {
  return html.replace(/<iframe(\s[^>]*?)>/gi, (match, attrs: string) => {
    const hasTitle = /\btitle\s*=\s*["'][^"']*["']/i.test(attrs);
    if (hasTitle) return match;

    const srcMatch = /\bsrc\s*=\s*(["'])([^"']+)\1/i.exec(attrs);
    if (!srcMatch) return match;

    const videoIdMatch = /(?:youtube(?:-nocookie)?\.com\/embed\/)([a-zA-Z0-9_-]{11})/.exec(srcMatch[2]);
    if (!videoIdMatch) return match;

    const title = titleMap.get(videoIdMatch[1]);
    if (!title) return match;

    const escapedTitle = title.replace(/"/g, '&quot;');
    return `<iframe${attrs} title="${escapedTitle}">`;
  });
}
