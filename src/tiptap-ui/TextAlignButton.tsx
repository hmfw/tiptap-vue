import { defineComponent, inject, type ShallowRef } from 'vue'
import type { Editor } from '@tiptap/core'
import IconButton from '../components/IconButton'

import AlignLeftIcon from '../tiptap-icons/AlignLeftIcon'
import AlignCenterIcon from '../tiptap-icons/AlignCenterIcon'
import AlignRightIcon from '../tiptap-icons/AlignRightIcon'
import AlignJustifyIcon from '../tiptap-icons/AlignJustifyIcon'

export default defineComponent({
  name: 'TextAlignButton',
  setup() {
    const editor = inject<ShallowRef<Editor | undefined>>('editor')

    return () => (
      <div>
        <IconButton
          icon={AlignLeftIcon}
          tooltip="左边对齐"
          isActive={editor?.value?.isActive({ textAlign: 'left' })}
          onClick={() => editor?.value?.chain().focus().setTextAlign('left').run()}
        />
        <IconButton
          icon={AlignCenterIcon}
          tooltip="中间对齐"
          isActive={editor?.value?.isActive({ textAlign: 'center' })}
          onClick={() => editor?.value?.chain().focus().setTextAlign('center').run()}
        />
        <IconButton
          icon={AlignRightIcon}
          tooltip="右边对齐"
          isActive={editor?.value?.isActive({ textAlign: 'right' })}
          onClick={() => editor?.value?.chain().focus().setTextAlign('right').run()}
        />
        <IconButton
          icon={AlignJustifyIcon}
          tooltip="两端对齐"
          isActive={editor?.value?.isActive({ textAlign: 'justify' })}
          onClick={() => editor?.value?.chain().focus().setTextAlign('justify').run()}
        />
      </div>
    )
  },
})
