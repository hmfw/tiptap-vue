<script setup lang="ts">
import { provide, ref } from 'vue'
import StarterKit from '@tiptap/starter-kit'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extensions'
import { ImageWithAlign } from './tiptap-extension/ImageWithAlign'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import { Mathematics } from '@tiptap/extension-mathematics'

import { ImageUpload } from './tiptap-extension/ImageUpload'

// --- Tiptap UI ---
import UndoRedoButton from './tiptap-ui/UndoRedoButton'
import TextStyleButton from './tiptap-ui/TextStyleButton'
import TextAlignButton from './tiptap-ui/TextAlignButton'
import ListButton from './tiptap-ui/ListButton'
import ImageButton from './tiptap-ui/ImageButton'
import TableButton from './tiptap-ui/TableButton'
import TableControls from './tiptap-ui/TableControls'
import MathButton from './tiptap-ui/MathButton'
import MathEditDialog from './tiptap-ui/MathEditDialog.vue'
import ImageControls from './tiptap-ui/ImageControls'

import 'katex/dist/katex.min.css'
import './editor.scss'

const mathEditVisible = ref(false)
const mathEditLatex = ref('')
const mathEditPos = ref<number | null>(null)
const mathEditType = ref<'inline' | 'block'>('inline')

const openMathDialog = (opts: { latex?: string; pos?: number | null; type?: 'inline' | 'block' } = {}) => {
  mathEditLatex.value = opts.latex ?? ''
  mathEditPos.value = opts.pos ?? null
  mathEditType.value = opts.type ?? 'inline'
  mathEditVisible.value = true
}

provide('openMathDialog', openMathDialog)

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: '请输入内容...',
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    ImageWithAlign.configure({
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
    Mathematics.configure({
      inlineOptions: {
        onClick: (node, pos) => openMathDialog({ latex: node.attrs.latex, pos, type: 'inline' }),
      },
      blockOptions: {
        onClick: (node, pos) => openMathDialog({ latex: node.attrs.latex, pos, type: 'block' }),
      },
    }),
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
      <TableButton />
      <MathButton />
    </div>
    <EditorContent class="tiptap-content" :editor="editor" />
    <TableControls />
    <ImageControls />
    <MathEditDialog
      v-model:visible="mathEditVisible"
      :latex="mathEditLatex"
      :pos="mathEditPos"
      :type="mathEditType"
    />
  </div>
</template>
