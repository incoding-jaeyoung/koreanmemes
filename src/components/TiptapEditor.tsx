"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { ImageExtension } from './editor/ImageExtension';
import { YoutubeWithTitle } from './editor/YoutubeWithTitle';
import { TwitterExtension } from './editor/TwitterExtension';
import { VideoExtension, detectVideoType } from './editor/VideoExtension';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { InputRule, nodeInputRule } from '@tiptap/core';
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Quote, Heading1, Heading2,
  Image as ImageIcon, Youtube as YoutubeIcon, Loader2,
  Video as VideoIcon
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

/** 에디터 내 이미지 노드 개수를 반환합니다. */
function getImageCount(editor: any): number {
  let count = 0;
  editor.state.doc.descendants((node: any) => {
    if (node.type.name === 'image') count++;
  });
  return count;
}

/** 에디터 내 video 노드 개수를 반환합니다. */
function getVideoCount(editor: any): number {
  let count = 0;
  editor.state.doc.descendants((node: any) => {
    if (node.type.name === 'video' || node.type.name === 'youtube') count++;
  });
  return count;
}

/** 에디터 내 tweet 노드 개수를 반환합니다. */
function getTweetCount(editor: any): number {
  let count = 0;
  editor.state.doc.descendants((node: any) => {
    if (node.type.name === 'tweet') count++;
  });
  return count;
}

interface UploadTracker {
  images: Map<string, string>; // url → cloudinary publicId
  videos: Map<string, string>; // url → cloudinary publicId
}

const MenuBar = ({
  editor,
  postTitle,
  t,
  uploadTracker,
}: {
  editor: any;
  postTitle?: string;
  t: (key: string) => string;
  uploadTracker: React.MutableRefObject<UploadTracker>;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const buildImageAlt = () => {
    const idx = getImageCount(editor) + 1;
    return postTitle ? `${postTitle} 이미지 ${idx}` : `이미지 ${idx}`;
  };

  const buildVideoTitle = () => {
    const idx = getVideoCount(editor) + 1;
    return postTitle ? `${postTitle} 동영상 ${idx}` : `동영상 ${idx}`;
  };

  const buildTweetTitle = () => {
    const idx = getTweetCount(editor) + 1;
    return postTitle ? `${postTitle} 트윗 ${idx}` : `트윗 ${idx}`;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(t('editor.imageSizeError'));
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      alert(t('editor.imageTypeError'));
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('업로드 실패');
      const data = await response.json();
      // 업로드된 이미지 추적 (url → storage path)
      uploadTracker.current.images.set(data.url, data.publicId);
      editor.chain().focus().setImage({ src: data.url, alt: buildImageAlt(), fullWidth: true } as any).run();
    } catch (error) {
      console.error('Upload error:', error);
      alert(t('editor.imageUploadFailed'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert(t('editor.videoSizeError'));
      return;
    }

    if (!['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(file.type)) {
      alert(t('editor.videoTypeError'));
      return;
    }

    setIsVideoUploading(true);
    try {
      // 1. 서버에서 업로드 서명 발급 (body 없음 — Vercel 제한 무관)
      const signRes = await fetch('/api/upload/video/sign');
      if (!signRes.ok) {
        const err = await signRes.json().catch(() => ({ error: '서명 발급 실패' }));
        throw new Error(err.error ?? '서명 발급 실패');
      }
      const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json();

      // 2. 브라우저 → Cloudinary 직접 업로드 (Next.js/Vercel body 제한 우회)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        { method: 'POST', body: formData }
      );
      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.error?.message ?? '업로드 실패');

      // 업로드된 영상 추적 (url → cloudinary publicId)
      uploadTracker.current.videos.set(data.secure_url, data.public_id);
      editor.chain().focus().setVideo({ src: data.secure_url, videoType: 'upload', title: buildVideoTitle() }).run();
    } catch (error: any) {
      console.error('Video upload error:', error);
      alert(error?.message ?? t('editor.videoUploadFailed'));
    } finally {
      setIsVideoUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const addYoutube = async () => {
    const url = window.prompt(t('editor.youtubePrompt'));
    if (!url) return;

    // 먼저 영상 삽입 — postTitle 기반 기본 title 설정 (빠른 피드백 + SEO 기본값)
    const defaultTitle = buildVideoTitle();
    editor.chain().focus().setYoutubeVideo({ src: url }).run();

    // 방금 삽입된 youtube 노드에 기본 title 즉시 적용
    {
      const { state, dispatch } = editor.view;
      let applied = false;
      const tr = state.tr;
      state.doc.descendants((node: any, pos: number) => {
        if (applied) return false;
        if (node.type.name === 'youtube' && !node.attrs.title) {
          const videoIdMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
          const nodeSrc = node.attrs.src ?? '';
          if (!videoIdMatch || nodeSrc.includes(videoIdMatch[1])) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, title: defaultTitle });
            applied = true;
          }
        }
      });
      if (applied) dispatch(tr);
    }

    // 백그라운드에서 oEmbed title 가져와서 보강 (postTitle + oEmbed 영상제목)
    try {
      const res = await fetch(`/api/youtube/oembed?url=${encodeURIComponent(url)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.title) return;

      const enrichedTitle = postTitle ? `${postTitle} - ${data.title}` : data.title;

      // 방금 삽입된 youtube 노드에 title 속성 업데이트
      const { state, dispatch } = editor.view;
      let updated = false;
      const tr = state.tr;
      state.doc.descendants((node: any, pos: number) => {
        if (updated) return false;
        if (node.type.name === 'youtube') {
          const normalizedSrc = node.attrs.src?.split('?')[0] ?? '';
          const normalizedUrl = url.split('?')[0];
          const videoIdMatch = normalizedUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
          if (videoIdMatch && normalizedSrc.includes(videoIdMatch[1])) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, title: enrichedTitle });
            updated = true;
          }
        }
      });
      if (updated) dispatch(tr);
    } catch {
      // oEmbed 실패 시 기본 title 유지
    }
  };

  const addTweet = () => {
    const url = window.prompt(t('editor.twitterPrompt'));
    if (!url) return;

    // 트윗 삽입 (SEO title 포함)
    editor.chain().focus().setTweet({ src: url, title: buildTweetTitle() }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 items-center p-2 rounded-t-lg border-b border-white/10 bg-white/5 shrink-0">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('bold') ? 'bg-brand-yellow text-black font-bold' : 'text-neutral-400'}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('italic') ? 'bg-brand-yellow text-black font-bold' : 'text-neutral-400'}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('underline') ? 'bg-brand-yellow text-black font-bold' : 'text-neutral-400'}`}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      
      <div className="mx-1 w-px h-5 bg-white/10" />
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 1 }) ? 'bg-brand-yellow text-black font-bold' : 'text-neutral-400'}`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 2 }) ? 'bg-brand-yellow text-black font-bold' : 'text-neutral-400'}`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      
      <div className="mx-1 w-px h-5 bg-white/10" />
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('bulletList') ? 'bg-brand-yellow text-black font-bold' : 'text-neutral-400'}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('orderedList') ? 'bg-brand-yellow text-black font-bold' : 'text-neutral-400'}`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      
      <div className="mx-1 w-px h-5 bg-white/10" />

      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-1.5 rounded hover:bg-white/10 text-neutral-400 disabled:opacity-50"
          title={t('editor.imageUpload')}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4.5 h-4.5" />
          )}
        </button>
      </div>

      <div className="relative">
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg,video/quicktime"
          onChange={handleVideoUpload}
          className="hidden"
          id="video-upload"
        />
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          disabled={isVideoUploading}
          className="p-1.5 rounded hover:bg-white/10 text-neutral-400 disabled:opacity-50"
          title={t('editor.videoUpload')}
        >
          {isVideoUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <VideoIcon className="w-4.5 h-4.5" />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={addYoutube}
        className="p-1.5 rounded hover:bg-white/10 text-neutral-400"
        title={t('editor.youtubeInsert')}
      >
        <YoutubeIcon className="w-5.5 h-5.5" />
      </button>

      <button
        type="button"
        onClick={addTweet}
        className="p-1.5 rounded hover:bg-white/10 text-neutral-400"
        title={t('editor.twitterInsert')}
      >
        <span className="flex justify-center items-center w-5 h-5 text-xl font-black">𝕏</span>
      </button>

    </div>
  );
};

export default function TiptapEditor({
  content,
  onChange,
  placeholder,
  postTitle,
  submittedRef,
}: {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  postTitle?: string;
  /** 글 저장 성공 여부 ref — true이면 언마운트 시 업로드 파일 삭제를 건너뜀 */
  submittedRef?: React.RefObject<boolean>;
}) {
  const { t } = useLanguage();
  const postTitleRef = useRef(postTitle);
  const tRef = useRef(t);
  // 현재 세션에서 업로드한 파일 추적 (에디터에서 제거 시 서버 파일 자동 삭제용)
  const uploadTracker = useRef<UploadTracker>({ images: new Map(), videos: new Map() });

  useEffect(() => {
    postTitleRef.current = postTitle;
  }, [postTitle]);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // 컴포넌트 언마운트 시 추적 중인 비디오/이미지 정리 (저장 완료 시엔 건너뜀)
  useEffect(() => {
    return () => {
      if (submittedRef?.current) return;
      uploadTracker.current.videos.forEach((publicId) => {
        fetch('/api/upload/video', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        }).catch(() => {});
      });
      uploadTracker.current.images.forEach((publicId) => {
        fetch('/api/upload/image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        }).catch(() => {});
      });
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
      }),
      HorizontalRule.extend({
        addInputRules() {
          return [
            // 기본 3개 대시 규칙 비활성화 및 5개 대시 규칙 추가
            nodeInputRule({
              find: /^(?:-----)$/,
              type: this.type,
            }),
          ];
        },
      }),
      Underline,
      ImageExtension,
      YoutubeWithTitle.configure({
        controls: true,
        allowFullscreen: true,
        autoplay: false,
      }),
      TwitterExtension,
      VideoExtension,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? t('board.write.contentPlaceholder'),
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());

      // 에디터에서 제거된 업로드 파일을 서버에서도 즉시 삭제
      const currentImageSrcs = new Set<string>();
      const currentVideoSrcs = new Set<string>();
      editor.state.doc.descendants((node: any) => {
        if (node.type.name === 'image' && node.attrs.src) currentImageSrcs.add(node.attrs.src);
        if (node.type.name === 'video' && node.attrs.src) currentVideoSrcs.add(node.attrs.src);
      });

      uploadTracker.current.images.forEach((publicId, url) => {
        if (!currentImageSrcs.has(url)) {
          uploadTracker.current.images.delete(url);
          fetch('/api/upload/image', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId }),
          }).then((res) => {
            if (!res.ok) {
              console.error('Image cleanup failed (status:', res.status, ') publicId:', publicId);
            }
          }).catch((e) => console.error('Image cleanup error:', e));
        }
      });

      uploadTracker.current.videos.forEach((publicId, url) => {
        if (!currentVideoSrcs.has(url)) {
          uploadTracker.current.videos.delete(url);
          fetch('/api/upload/video', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId }),
          }).then((res) => {
            if (!res.ok) {
              console.error('Video cleanup failed (status:', res.status, ') publicId:', publicId);
            }
          }).catch((e) => console.error('Video cleanup error:', e));
        }
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4 text-white',
      },
      handleKeyDown: (view, event) => {
        // Backspace/Delete 시 미디어 노드 삭제 확인
        if (event.key === 'Backspace' || event.key === 'Delete') {
          const { state } = view;
          const { selection } = state;
          const mediaTypes = ['image', 'video', 'youtube', 'tweet'];

          // Case 1: 미디어 노드가 직접 선택된 경우 (NodeSelection)
          const selectedNode = (selection as any).node;
          if (selectedNode && mediaTypes.includes(selectedNode.type.name)) {
            if (!window.confirm(tRef.current('editor.deleteMediaConfirm'))) {
              return true; // 삭제 취소
            }
            return false; // 기본 삭제 허용
          }

          // Case 2: 커서가 미디어 노드 바로 앞/뒤에 위치한 경우
          if (selection.empty) {
            const adjacentNode = event.key === 'Backspace'
              ? selection.$from.nodeBefore
              : selection.$from.nodeAfter;
            if (adjacentNode && mediaTypes.includes(adjacentNode.type.name)) {
              if (!window.confirm(tRef.current('editor.deleteMediaConfirm'))) {
                return true; // 삭제 취소
              }
              return false; // 기본 삭제 허용
            }
          }
        }

        return false;
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (!text) return false;

        // 동영상 URL 감지 (Vimeo 또는 직접 mp4/webm/ogg/mov 링크)
        const videoType = detectVideoType(text.trim());
        if (videoType) {
          const { schema } = view.state;
          if (schema.nodes.video) {
            let videoCount = 0;
            view.state.doc.descendants((n: any) => {
              if (n.type.name === 'video' || n.type.name === 'youtube') videoCount++;
            });
            const videoTitle = postTitleRef.current
              ? `${postTitleRef.current} 동영상 ${videoCount + 1}`
              : `동영상 ${videoCount + 1}`;
            const node = schema.nodes.video.create({ src: text.trim(), videoType, title: videoTitle, fullWidth: true });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);
            return true;
          }
        }

        // 이미지 주소 감지 (http(s)로 시작하고 이미지 확장자로 끝나는 경우)
        const imageRegex = /^https?:\/\/\S+\.(jpg|jpeg|png|gif|webp|svg)(?:\?\S+)?$/i;
        if (imageRegex.test(text.trim())) {
          const { schema } = view.state;
          if (schema.nodes.image) {
            let imageCount = 0;
            view.state.doc.descendants((node: any) => {
              if (node.type.name === 'image') imageCount++;
            });
            const alt = postTitleRef.current
              ? `${postTitleRef.current} 이미지 ${imageCount + 1}`
              : `이미지 ${imageCount + 1}`;
            const node = schema.nodes.image.create({ src: text.trim(), alt, fullWidth: true });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);
            return true; // 기본 텍스트 삽입 방지
          }
        }
        return false;
      },
    },
    immediatelyRender: false,
  }, [placeholder]);

  return (
    <div className="flex flex-col w-full max-h-[calc(100vh-12rem)] rounded-lg border transition-colors bg-white/5 border-white/10 focus-within:border-brand-yellow/50 overflow-hidden">
      <MenuBar
        editor={editor}
        postTitle={postTitle}
        t={t}
        uploadTracker={uploadTracker}
      />
      <div className="flex-1 min-h-[400px] overflow-auto">
        <EditorContent editor={editor} />
      </div>
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--brand-yellow);
          pointer-events: none;
          height: 0;
          white-space: pre-line;
        }

        /* 문단 간격 조정 */
        .ProseMirror p {
          margin-top: 0;
          margin-top: 0;
          margin-bottom: 0;
          line-height: 2;
          min-height: 2em;
        }

        /* 제목 간격 제거 및 볼드체 강화 */
        .ProseMirror h1, .ProseMirror h2 {
          margin-top: 0;
          margin-bottom: 0;
          line-height: 2;
        }
        .ProseMirror strong {
          font-weight: 900;
        }

        /* 리스트 및 일반 텍스트 간격 조정 */
        .ProseMirror ul, .ProseMirror ol {
          margin-top: 0;
          margin-bottom: 0;
          padding-left: 1.5em;
        }
        .ProseMirror li {
          margin-top: 0;
          margin-bottom: 0;
          line-height: 2;
        }
        .ProseMirror {
          line-height: 2;
        }
        
        /* YouTube 반응형 스타일 */
        .ProseMirror iframe[src*="youtube.com"],
        .ProseMirror iframe[src*="youtu.be"],
        .ProseMirror .youtube-video {
          width: 100% !important;
          aspect-ratio: 16 / 9;
          max-width: 100%;
          height: auto !important;
          border-radius: 8px;
          margin: 1rem 0;
        }

        /* Twitter 트윗 스타일 (에디터 내 플레이스홀더) */
        .ProseMirror .tweet-embed {
          max-width: 550px;
          margin: 1.5rem auto;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ProseMirror .tweet-embed::before {
          content: '🐦 트윗 로딩 중...';
          display: block;
          font-weight: bold;
        }


        /* 구분선 스타일 커스터마이징 */
        .ProseMirror hr {
          margin-top: 2rem;
          margin-bottom: 2rem;
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
