import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

// 에디터 내부 이미지 NodeView
const ImageNodeView = ({ node, updateAttributes, selected }: any) => {
  const { src, alt, fullWidth } = node.attrs;

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
          display: 'block',
          width: fullWidth ? '100%' : 'fit-content',
          maxWidth: '100%',
          outline: selected ? '2px solid #e2e800' : 'none',
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

        <img
          src={src}
          alt={alt ?? ''}
          style={{
            width: fullWidth ? '100%' : 'auto',
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '8px',
          }}
        />
      </div>
    </NodeViewWrapper>
  );
};

// @tiptap/extension-image를 확장해 fullWidth 속성 + NodeView 추가
export const ImageExtension = Image.extend({
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      fullWidth: {
        default: true,
        parseHTML: (el) => el.getAttribute('data-full-width') !== 'false',
        renderHTML: (attrs) => ({ 'data-full-width': String(attrs.fullWidth) }),
      },
    };
  },

  // 저장된 HTML 렌더링 (게시글 뷰어용)
  renderHTML({ HTMLAttributes }) {
    const isFullWidth = HTMLAttributes['data-full-width'] !== 'false';
    return [
      'img',
      {
        ...HTMLAttributes,
        style: isFullWidth
          ? 'width:100%;height:auto;border-radius:8px;display:block;margin:1rem 0'
          : 'width:auto;max-width:100%;height:auto;border-radius:8px;display:block;margin:1rem 0',
      },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
