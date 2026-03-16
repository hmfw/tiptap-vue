<script setup lang="ts">
import { provide } from 'vue'
import StarterKit from '@tiptap/starter-kit'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extensions'
import { Image } from '@tiptap/extension-image'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'

import { ImageUpload } from './tiptap-extension/ImageUpload'

// --- Tiptap UI ---
import UndoRedoButton from './tiptap-ui/UndoRedoButton'
import TextStyleButton from './tiptap-ui/TextStyleButton'
import TextAlignButton from './tiptap-ui/TextAlignButton'
import ListButton from './tiptap-ui/ListButton'
import ImageButton from './tiptap-ui/ImageButton'
import TableButton from './tiptap-ui/TableButton'
import TableControls from './tiptap-ui/TableControls'

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
    Image.configure({
      allowBase64: true,
      resize: {
        enabled: true,
        directions: [
          'top',
          'right',
          'bottom',
          'left',
          'top-right',
          'top-left',
          'bottom-right',
          'bottom-left',
        ],
        minWidth: 50,
        minHeight: 50,
        alwaysPreserveAspectRatio: false,
      },
    }),
    ImageUpload,
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
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
      <div class="tiptap-separator"></div>
      <TableButton />
    </div>
    <EditorContent class="tiptap-content" :editor="editor" />
    <TableControls />
  </div>
</template>
