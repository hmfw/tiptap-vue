<script setup lang="ts">
import { provide } from 'vue'
import StarterKit from '@tiptap/starter-kit'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Placeholder } from '@tiptap/extensions'

// --- Tiptap UI ---
import UndoRedoButton from './tiptap-ui/UndoRedoButton'
import TextStyleButton from './tiptap-ui/TextStyleButton'
import TextAlignButton from './tiptap-ui/TextAlignButton'
import ListButton from './tiptap-ui/ListButton'
import ImageButton from './tiptap-ui/ImageButton'

import './editor.scss'

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: '请输入内容...',
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
  ],
})

provide('editor', editor)
</script>
<template>
  <div class="tiptap-editor">
    <div class="tiptap-toolbar">
      <UndoRedoButton />
      <div class="tiptap-separator"></div>
      <TextStyleButton />
      <div class="tiptap-separator"></div>
      <ListButton />
      <div class="tiptap-separator"></div>
      <TextAlignButton />
      <div class="tiptap-separator"></div>
      <ImageButton />
    </div>
    <EditorContent class="editor-content" :editor="editor" />
  </div>
</template>
