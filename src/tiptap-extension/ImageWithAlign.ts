import { Image } from '@tiptap/extension-image'
import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const ImageWithAlign = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'left',
        parseHTML: (element) => element.getAttribute('data-align') ?? 'left',
        renderHTML: (attributes) => ({ 'data-align': attributes.align }),
      },
    }
  },

  addProseMirrorPlugins() {
    const name = this.name
    return [
      new Plugin({
        props: {
          decorations(state) {
            const decorations: Decoration[] = []
            state.doc.descendants((node, pos) => {
              if (node.type.name === name && node.attrs.align) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    'data-align': node.attrs.align,
                  }),
                )
              }
            })
            return DecorationSet.create(state.doc, decorations)
          },
        },
      }),
    ]
  },
})
