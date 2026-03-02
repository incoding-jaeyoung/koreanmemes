import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';

export const Direction = Node.create({
  name: 'direction',

  group: 'inline',

  inline: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      value: {
        default: '5',
        parseHTML: element => element.getAttribute('data-value'),
        renderHTML: attributes => ({
          'data-value': attributes.value,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-value]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const value = HTMLAttributes['data-value'];
    const arrows: { [key: string]: string } = {
      '1': '↙',
      '2': '↓',
      '3': '↘',
      '4': '←',
      '5': '5',
      '6': '→',
      '7': '↖',
      '8': '↑',
      '9': '↗',
    };

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: `direction-icon dir-${value}`,
        'data-value': value,
      }),
      value === '5' ? 'N' : arrows[value] || value,
    ];
  },

  addInputRules() {
    return [
      // [1] ~ [9]
      nodeInputRule({
        find: /\[([1-9])\]$/,
        type: this.type,
        getAttributes: match => ({
          value: match[1],
        }),
      }),
      // ,1 ~ ,9 (Fast prefix)
      nodeInputRule({
        find: /,([1-9])$/,
        type: this.type,
        getAttributes: match => ({
          value: match[1],
        }),
      }),
    ];
  },
});
