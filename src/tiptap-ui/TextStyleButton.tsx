import { defineComponent, inject, type ShallowRef } from 'vue'
import type { Editor } from '@tiptap/core'
import IconButton from '../components/IconButton'

import BoldIcon from '../tiptap-icons/BoldIcon'
import ItalicIcon from '../tiptap-icons/ItalicIcon'
import StrikeIcon from '../tiptap-icons/StrikeIcon'
import UnderlineIcon from '../tiptap-icons/UnderlineIcon'
import LinkIcon from '../tiptap-icons/LinkIcon'

export default defineComponent({
  name: 'TextStyleButton',
  setup() {
    const editor = inject<ShallowRef<Editor | undefined>>('editor')

    const toggleLink = () => {
      const e = editor?.value
      if (!e) return
      if (e.isActive('link')) {
        e.chain().focus().unsetLink().run()
      } else {
        const href = window.prompt('请输入链接')
        if (href) e.chain().focus().setLink({ href }).run()
      }
    }

    return () => (
      <div>
        <IconButton
          icon={BoldIcon}
          tooltip="粗体"
          isActive={editor?.value?.isActive('bold')}
          onClick={() => editor?.value?.chain().focus().toggleBold().run()}
        />
        <IconButton
          icon={ItalicIcon}
          tooltip="斜体"
          isActive={editor?.value?.isActive('italic')}
          onClick={() => editor?.value?.chain().focus().toggleItalic().run()}
        />
        <IconButton
          icon={StrikeIcon}
          tooltip="删除线"
          isActive={editor?.value?.isActive('strike')}
          onClick={() => editor?.value?.chain().focus().toggleStrike().run()}
        />
        <IconButton
          icon={UnderlineIcon}
          tooltip="下划线"
          isActive={editor?.value?.isActive('underline')}
          onClick={() => editor?.value?.chain().focus().toggleUnderline().run()}
        />
        <IconButton
          icon={LinkIcon}
          tooltip="链接"
          isActive={editor?.value?.isActive('link')}
          onClick={toggleLink}
        />
      </div>
    )
  },
})
