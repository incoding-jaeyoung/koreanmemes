"use client";

import React from "react";

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;

interface Props {
  text: string;
  className?: string;
}

/**
 * 댓글 텍스트를 렌더링하며 URL을 자동 링크화
 * dangerouslySetInnerHTML 없이 XSS 안전하게 구현
 */
export default function CommentContent({ text, className }: Props) {
  const parts = React.useMemo(() => {
    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    URL_REGEX.lastIndex = 0;
    while ((match = URL_REGEX.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push(text.slice(lastIndex, match.index));
      }
      const url = match[0];
      result.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-blue hover:underline break-all"
        >
          {url}
        </a>
      );
      lastIndex = match.index + url.length;
    }

    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  }, [text]);

  return (
    <p className={`whitespace-pre-wrap ${className ?? ""}`}>
      {parts}
    </p>
  );
}
