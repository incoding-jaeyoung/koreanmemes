import { Node, nodePasteRule } from '@tiptap/core';

/**
 * Twitter/X 트윗 임베드 확장 (oEmbed 방식)
 * URL을 붙여넣으면 자동으로 트윗 노드 생성
 */

// Twitter/X URL 정규식 (쿼리 파라미터까지 포함)
const TWITTER_REGEX = /^https?:\/\/(twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(\S+)?$/;
const TWITTER_REGEX_GLOBAL = /^https?:\/\/(twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(\S+)?$/g;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tweet: {
      /**
       * 트윗 노드 삽입
       */
      setTweet: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export const TwitterExtension = Node.create({
  name: 'tweet',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
        renderHTML: (attrs) => (attrs.title ? { 'data-title': attrs.title } : {}),
        parseHTML: (el) => el.getAttribute('data-title') ?? null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-tweet-url]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return false;
          const url = dom.getAttribute('data-tweet-url');
          return url ? { src: url } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs: Record<string, string> = {
      class: 'tweet-embed',
      'data-tweet-url': HTMLAttributes.src,
    };
    if (HTMLAttributes.title) {
      attrs['aria-label'] = HTMLAttributes.title;
      attrs['data-title'] = HTMLAttributes.title;
    }
    return ['div', attrs];
  },

  addCommands() {
    return {
      setTweet:
        (options) =>
        ({ commands }) => {
          const isValid = TWITTER_REGEX.test(options.src);
          if (!isValid) {
            console.warn('Invalid Twitter URL:', options.src);
            return false;
          }

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              title: options.title ?? null,
            },
          });
        },
    };
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: TWITTER_REGEX_GLOBAL,
        type: this.type,
        getAttributes: (match) => {
          const url = match.input || match[0];
          console.log('Twitter paste detected:', url);
          return {
            src: url,
          };
        },
      }),
    ];
  },
});
