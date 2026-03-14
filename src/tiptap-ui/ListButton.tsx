import { defineComponent, inject, type ShallowRef } from 'vue'
import type { Editor } from '@tiptap/core'
import IconButton from '../components/IconButton'

import ListIcon from '../tiptap-icons/ListIcon'
import ListOrderedIcon from '../tiptap-icons/ListOrderedIcon'
import ListTodoIcon from '../tiptap-icons/ListTodoIcon'

export default defineComponent({
  name: 'ListButton',
  setup() {
    const editor = inject<ShallowRef<Editor | undefined>>('editor')

    return () => (
      <div>
        <IconButton
          icon={ListIcon}
          tooltip="无序列表"
          isActive={editor?.value?.isActive('bulletList')}
          onClick={() => editor?.value?.chain().focus().toggleBulletList().run()}
        />
        <IconButton
          icon={ListOrderedIcon}
          tooltip="有序列表"
          isActive={editor?.value?.isActive('orderedList')}
          onClick={() => editor?.value?.chain().focus().toggleOrderedList().run()}
        />
        <IconButton
          icon={ListTodoIcon}
          tooltip="任务列表"
          isActive={editor?.value?.isActive('taskList')}
          onClick={() => editor?.value?.chain().focus().toggleTaskList().run()}
        />
      </div>
    )
  },
})
