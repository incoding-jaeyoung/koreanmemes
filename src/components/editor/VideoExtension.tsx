import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export interface VideoOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; videoType?: 'upload' | 'vimeo' | 'direct'; title?: string }) => ReturnType;
      setVideoSize: (fullWidth: boolean) => ReturnType;
    };
  }
}

function getCloudinaryPoster(src: string): string | null {
  const match = src.match(/(res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.*?)\.(mp4|webm|ogg|mov)(\?.*)?$/i);
  if (!match) return null;
  return `https://${match[1]}so_2,f_jpg,q_auto,w_800/${match[2]}.jpg`;
}

function getVimeoEmbedUrl(url: string): string | null {
  const match = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (!match) return null;
  return `https://player.vimeo.com/video/${match[1]}`;
}

export function detectVideoType(url: string): 'vimeo' | 'direct' | null {
  if (/vimeo\.com/i.test(url)) return 'vimeo';
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return 'direct';
  return null;
}

// 에디터 내부 렌더링 NodeView
const VideoNodeView = ({ node, updateAttributes, selected }: any) => {
  const { src, videoType, fullWidth } = node.attrs;
  const poster = getCloudinaryPoster(src) ?? undefined;

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
        }}
        className="group"
      >
        {/* 크기 토글 버튼 — opacity-0 상태에서도 pointer-events 차단 */}
        <button
          type="button"
          contentEditable={false}
          onClick={toggleSize}
          className="flex absolute right-0 top-4 z-10 gap-2 justify-center items-center w-10 h-10 text-sm font-bold text-black rounded-lg opacity-0 transition-opacity duration-150 cursor-pointer pointer-events-none media-size-toggle bg-brand-yellow shrink-0 group-hover:opacity-100 group-hover:pointer-events-auto"
        >
          {fullWidth ? <Minimize2 className="w-5 h-5" strokeWidth={3} /> : <Maximize2 className="w-5 h-5" strokeWidth={3} />}
        </button>

        {videoType === 'vimeo' ? (
          <iframe
            src={getVimeoEmbedUrl(src) ?? src}
            style={{
              width: fullWidth ? '100%' : '640px',
              aspectRatio: '16/9',
              border: 'none',
              display: 'block',
              background: '#000',
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={src}
            poster={poster}
            controls
            playsInline
            preload="metadata"
            style={{
              width: fullWidth ? '100%' : 'auto',
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              background: '#000',
            }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const VideoExtension = Node.create<VideoOptions>({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      videoType: { default: 'upload' },
      title: {
        default: null,
        renderHTML: (attrs) => (attrs.title ? { 'data-title': attrs.title } : {}),
        parseHTML: (el) => el.getAttribute('data-title') ?? null,
      },
      fullWidth: {
        default: true,
        parseHTML: (el) => el.getAttribute('data-full-width') !== 'false',
        renderHTML: (attrs) => ({ 'data-full-width': String(attrs.fullWidth) }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video]',
        getAttrs: (el) => ({
          src: (el as HTMLElement).getAttribute('data-src'),
          videoType: (el as HTMLElement).getAttribute('data-video-type') || 'upload',
          fullWidth: (el as HTMLElement).getAttribute('data-full-width') !== 'false',
        }),
      },
    ];
  },

  // 저장된 HTML 렌더링 (게시글 뷰어용)
  renderHTML({ HTMLAttributes }) {
    const { src, videoType, 'data-full-width': fullWidthAttr, 'data-title': titleAttr } = HTMLAttributes;
    const isFullWidth = fullWidthAttr !== 'false';
    const title = titleAttr ?? null;

    const wrapperStyle = isFullWidth
      ? 'width:100%;margin:1rem 0'
      : 'width:fit-content;max-width:100%;margin:1rem 0';

    if (videoType === 'vimeo') {
      const embedUrl = getVimeoEmbedUrl(src) ?? src;
      const iframeAttrs: Record<string, string> = {
        src: embedUrl,
        frameborder: '0',
        allow: 'autoplay; fullscreen; picture-in-picture',
        allowfullscreen: 'true',
      };
      if (title) iframeAttrs.title = title;
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, {
          'data-video': '',
          'data-src': src,
          'data-video-type': 'vimeo',
          'data-full-width': String(isFullWidth),
          ...(title ? { 'data-title': title } : {}),
          class: 'video-embed vimeo-embed',
          style: wrapperStyle,
        }),
        ['iframe', iframeAttrs],
      ];
    }

    const poster = getCloudinaryPoster(src);
    const videoAttrs: Record<string, string> = {
      src,
      controls: 'true',
      playsinline: 'true',
      preload: 'metadata',
      style: isFullWidth ? 'width:100%;height:auto' : 'width:auto;max-width:100%;height:auto',
    };
    if (poster) videoAttrs.poster = poster;
    if (title) videoAttrs.title = title;

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-video': '',
        'data-src': src,
        'data-video-type': videoType,
        'data-full-width': String(isFullWidth),
        ...(title ? { 'data-title': title } : {}),
        class: 'video-embed native-video',
        style: wrapperStyle,
      }),
      ['video', videoAttrs],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { ...options, title: options.title ?? null, fullWidth: true } }),
      setVideoSize:
        (fullWidth) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { fullWidth }),
    };
  },
});
