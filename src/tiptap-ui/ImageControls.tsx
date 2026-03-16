import { defineComponent, inject, ref, watchEffect, type ShallowRef } from 'vue'
import type { Editor } from '@tiptap/core'
import { NodeSelection } from '@tiptap/pm/state'
import AlignLeftIcon from '../tiptap-icons/AlignLeftIcon'
import AlignCenterIcon from '../tiptap-icons/AlignCenterIcon'
import AlignRightIcon from '../tiptap-icons/AlignRightIcon'

interface ImageInfo {
  pos: number
  nodeSize: number
  src: string
  align: string
}

function getImageInfo(editor: Editor): ImageInfo | null {
  if (!editor.isActive('image')) return null

  const { selection } = editor.state
  if (!(selection instanceof NodeSelection)) return null
  if (selection.node.type.name !== 'image') return null

  const node = selection.node
  return {
    pos: selection.from,
    nodeSize: node.nodeSize,
    src: node.attrs.src as string,
    align: (node.attrs.align as string) ?? 'left',
  }
}

function downloadImage(src: string) {
  const filename = src.startsWith('data:')
    ? 'image.png'
    : src.split('/').pop()?.split('?')[0] || 'image.png'
  const a = document.createElement('a')
  a.href = src
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const RefreshIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.1L1 10" />
  </svg>
)

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

export default defineComponent({
  name: 'ImageControls',
  setup() {
    const editor = inject<ShallowRef<Editor | undefined>>('editor')
    const info = ref<ImageInfo | null>(null)

    function updateControls() {
      const ed = editor?.value
      if (!ed) {
        info.value = null
        return
      }
      info.value = getImageInfo(ed)
    }

    watchEffect((cleanup) => {
      const ed = editor?.value
      if (!ed) return
      ed.on('selectionUpdate', updateControls)
      ed.on('transaction', updateControls)
      cleanup(() => {
        ed.off('selectionUpdate', updateControls)
        ed.off('transaction', updateControls)
      })
    })

    return () => {
      const i = info.value
      if (!i) return null
      const ed = editor?.value
      if (!ed) return null

      const { pos, nodeSize, src, align } = i

      // 每次渲染时实时获取 rect，避免因图片尚未加载完成导致坐标错误
      // nodeDOM 返回 [data-resize-container]，wrapper 是其子元素，用 wrapper 的 rect 定位工具栏
      const dom = ed.view.nodeDOM(pos)
      if (!dom || !(dom instanceof HTMLElement)) return null
      const target = (dom.querySelector('[data-resize-wrapper]') ?? dom) as HTMLElement
      const editorEl = ed.view.dom.closest('.tiptap-editor')
      if (!editorEl) return null
      const rect = target.getBoundingClientRect()
      const editorRect = editorEl.getBoundingClientRect()

      const style = {
        position: 'absolute' as const,
        top: `${rect.top - editorRect.top}px`,
        left: `${rect.left - editorRect.left + rect.width / 2}px`,
        transform: 'translate(-50%, calc(-100% - 8px))',
        zIndex: 20,
      }

      return (
        <div class="image-controls" style={style}>
          <button
            class={['image-controls-btn', align === 'left' && 'is-active']}
            title="居左"
            onMousedown={(e: MouseEvent) => e.preventDefault()}
            onClick={() =>
              ed.chain().focus().updateAttributes('image', { align: 'left' }).run()
            }
          >
            <AlignLeftIcon />
          </button>
          <button
            class={['image-controls-btn', align === 'center' && 'is-active']}
            title="居中"
            onMousedown={(e: MouseEvent) => e.preventDefault()}
            onClick={() =>
              ed.chain().focus().updateAttributes('image', { align: 'center' }).run()
            }
          >
            <AlignCenterIcon />
          </button>
          <button
            class={['image-controls-btn', align === 'right' && 'is-active']}
            title="居右"
            onMousedown={(e: MouseEvent) => e.preventDefault()}
            onClick={() =>
              ed.chain().focus().updateAttributes('image', { align: 'right' }).run()
            }
          >
            <AlignRightIcon />
          </button>

          <span class="image-controls-separator" />

          <button
            class="image-controls-btn"
            title="下载"
            onMousedown={(e: MouseEvent) => e.preventDefault()}
            onClick={() => downloadImage(src)}
          >
            <DownloadIcon />
          </button>
          <button
            class="image-controls-btn"
            title="重新上传"
            onMousedown={(e: MouseEvent) => e.preventDefault()}
            onClick={() =>
              ed
                .chain()
                .focus()
                .deleteRange({ from: pos, to: pos + nodeSize })
                .insertContentAt(pos, { type: 'imageUpload' })
                .run()
            }
          >
            <RefreshIcon />
          </button>
          <button
            class="image-controls-btn"
            title="删除"
            onMousedown={(e: MouseEvent) => e.preventDefault()}
            onClick={() =>
              ed
                .chain()
                .focus()
                .deleteRange({ from: pos, to: pos + nodeSize })
                .run()
            }
          >
            <TrashIcon />
          </button>
        </div>
      )
    }
  },
})
