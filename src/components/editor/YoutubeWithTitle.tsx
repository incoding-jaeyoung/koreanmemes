import Youtube from '@tiptap/extension-youtube';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

function getYoutubeEmbedUrl(src: string): string {
  if (!src) return src;
  // 이미 embed URL인 경우
  if (src.includes('/embed/')) return src;
  // Shorts URL: youtube.com/shorts/VIDEO_ID
  const shortsMatch = src.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  // 일반 URL: watch?v=, youtu.be/, v/
  const match = src.match(/(?:youtube\.com\/(?:watch\?v=|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return src;
}

// 에디터 내부 YouTube NodeView
const YoutubeNodeView = ({ node, updateAttributes, selected }: any) => {
  const { src, title, fullWidth } = node.attrs;
  const embedUrl = getYoutubeEmbedUrl(src);

  const toggleSize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateAttributes({ fullWidth: !fullWidth });
  };

  return (
    <NodeViewWrapper data-drag-handle>
      <div
        style={{
          position: 'relative',
          width: fullWidth ? '100%' : 'fit-content',
          maxWidth: '100%',
          outline: selected ? '2px solid #e2e800' : 'none',
          outlineOffset: '2px',
          overflow: 'hidden',
          margin: '1rem 0',
        }}
        className="group"
      >
        <button
          type="button"
          contentEditable={false}
          onClick={toggleSize}
          className="flex absolute right-0 top-4 z-10 gap-2 justify-center items-center w-10 h-10 text-sm font-bold text-black rounded-lg opacity-0 transition-opacity duration-150 cursor-pointer pointer-events-none media-size-toggle bg-brand-yellow shrink-0 group-hover:opacity-100 group-hover:pointer-events-auto"
        >
          {fullWidth
            ? <Minimize2 className="w-5 h-5" strokeWidth={3} />
            : <Maximize2 className="w-5 h-5" strokeWidth={3} />}
        </button>

        <iframe
          src={embedUrl}
          title={title ?? 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            width: fullWidth ? '100%' : '640px',
            maxWidth: '100%',
            aspectRatio: '16/9',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </NodeViewWrapper>
  );
};

export const YoutubeWithTitle = Youtube.extend({
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      title: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { title: attributes.title };
        },
      },
      fullWidth: {
        default: true,
        renderHTML: (attrs) => ({ 'data-full-width': String(attrs.fullWidth) }),
      },
    };
  },

  // 부모 Youtube 확장의 parseHTML은 div[data-youtube-video] 안의 iframe을 매칭하므로
  // iframe에 없는 data-full-width를 읽지 못함 → div를 직접 매칭하도록 오버라이드
  parseHTML() {
    return [
      {
        tag: 'div[data-youtube-video]',
        getAttrs: (node) => {
          const el = node as HTMLElement;
          const iframe = el.querySelector('iframe');
          if (!iframe) return false;
          return {
            src: iframe.getAttribute('src') ?? '',
            title: iframe.getAttribute('title') ?? null,
            fullWidth: el.getAttribute('data-full-width') !== 'false',
          };
        },
      },
    ];
  },

  // 저장된 HTML 렌더링 (게시글 뷰어용)
  renderHTML({ HTMLAttributes }) {
    const { src, title, 'data-full-width': fullWidthAttr } = HTMLAttributes;
    const isFullWidth = fullWidthAttr !== 'false';
    const embedUrl = getYoutubeEmbedUrl(src ?? '');

    const wrapperStyle = isFullWidth
      ? 'width:100%;margin:1rem 0;border-radius:8px;overflow:hidden'
      : 'width:fit-content;max-width:100%;margin:1rem 0;border-radius:8px;overflow:hidden';

    const iframeStyle = isFullWidth
      ? 'width:100%;aspect-ratio:16/9;border:none;display:block'
      : 'width:640px;max-width:100%;aspect-ratio:16/9;border:none;display:block';

    return [
      'div',
      {
        'data-youtube-video': '',
        'data-full-width': String(isFullWidth),
        class: 'youtube-embed',
        style: wrapperStyle,
      },
      [
        'iframe',
        {
          src: embedUrl,
          ...(title ? { title } : {}),
          frameborder: '0',
          allowfullscreen: 'true',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          style: iframeStyle,
        },
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(YoutubeNodeView);
  },
});
