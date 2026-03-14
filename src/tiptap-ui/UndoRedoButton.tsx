import { defineComponent, inject, computed, type ShallowRef } from 'vue'
import type { Editor } from '@tiptap/core'
import IconButton from '../components/IconButton'

import UndoIcon from '../tiptap-icons/UndoIcon'
import RedoIcon from '../tiptap-icons/RedoIcon'

export default defineComponent({
  name: 'UndoRedoButton',
  setup() {
    const editor = inject<ShallowRef<Editor | undefined>>('editor')

    const canUndo = computed(() => editor?.value?.can().undo() ?? false)
    const canRedo = computed(() => editor?.value?.can().redo() ?? false)

    return () => (
      <div>
        <IconButton
          icon={UndoIcon}
          tooltip="撤销"
          disabled={!canUndo.value}
          onClick={() => editor?.value?.chain().focus().undo().run()}
        />
        <IconButton
          icon={RedoIcon}
          tooltip="重做"
          disabled={!canRedo.value}
          onClick={() => editor?.value?.chain().focus().redo().run()}
        />
      </div>
    )
  },
})
