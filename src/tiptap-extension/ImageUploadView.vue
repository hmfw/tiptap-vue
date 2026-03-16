<script setup lang="ts">
import { ref, computed } from 'vue'
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const accept = computed(() => props.node.attrs.accept as string)
const limit = computed(() => props.node.attrs.limit as number)
const maxSize = computed(() => props.node.attrs.maxSize as number)

interface FileItem {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
}

const fileItems = ref<FileItem[]>([])
const inputRef = ref<HTMLInputElement>()
const isDragActive = ref(false)

const uploadFile = async (file: File): Promise<string | null> => {
  if (maxSize.value > 0 && file.size > maxSize.value) {
    props.extension.options.onError?.(
      new Error(`文件大小超出限制 ${maxSize.value / 1024 / 1024}MB`),
    )
    return null
  }

  const id = crypto.randomUUID()
  fileItems.value.push({ id, file, progress: 0, status: 'uploading' })

  try {
    const uploadFn = props.extension.options.upload
    if (!uploadFn) throw new Error('未配置 upload 函数')

    const url = await uploadFn(file)
    if (!url) throw new Error('上传失败：未返回 URL')

    const item = fileItems.value.find((f) => f.id === id)
    if (item) {
      item.status = 'success'
      item.progress = 100
    }
    props.extension.options.onSuccess?.(url)
    return url
  } catch (err) {
    const item = fileItems.value.find((f) => f.id === id)
    if (item) {
      item.status = 'error'
      item.progress = 0
    }
    props.extension.options.onError?.(err instanceof Error ? err : new Error('上传失败'))
    return null
  }
}

const handleFiles = async (files: File[]) => {
  if (!files.length) return

  if (files.length > limit.value) {
    props.extension.options.onError?.(new Error(`最多上传 ${limit.value} 个文件`))
    return
  }

  const urls = (await Promise.all(files.map(uploadFile))).filter((u): u is string => !!u)
  if (urls.length > 0) {
    const pos = props.getPos()
    if (typeof pos !== 'number') return

    const imageNodes = urls.map((src) => ({ type: 'image', attrs: { src } }))
    props.editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + props.node.nodeSize })
      .insertContentAt(pos, imageNodes)
      .run()
  }
}

const handleClick = () => {
  if (fileItems.value.length === 0 && inputRef.value) {
    inputRef.value.value = ''
    inputRef.value.click()
  }
}

const handleChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) handleFiles(Array.from(files))
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragActive.value = true
}

const handleDragLeave = (e: DragEvent) => {
  if (!(e.currentTarget as Element).contains(e.relatedTarget as Node)) {
    isDragActive.value = false
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragActive.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  if (files.length) handleFiles(files)
}

const removeFile = (id: string) => {
  fileItems.value = fileItems.value.filter((f) => f.id !== id)
}
</script>

<template>
  <NodeViewWrapper class="tiptap-image-upload" @click="handleClick">
    <div
      v-if="!fileItems.length"
      class="tiptap-image-upload-drag-area"
      :class="{ 'drag-active': isDragActive }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="tiptap-image-upload-content">
        <span class="tiptap-image-upload-text"><em>点击上传</em> 或拖拽图片到此处</span>
        <span class="tiptap-image-upload-subtext">
          最多 {{ limit }} 个文件{{ maxSize ? `，每个不超过 ${maxSize / 1024 / 1024}MB` : '' }}
        </span>
      </div>
    </div>

    <div v-else class="tiptap-image-upload-previews">
      <div v-for="item in fileItems" :key="item.id" class="tiptap-image-upload-preview">
        <div
          v-if="item.status === 'uploading'"
          class="tiptap-image-upload-progress"
          :style="{ width: `${item.progress}%` }"
        />
        <div class="tiptap-image-upload-preview-content">
          <span class="tiptap-image-upload-text">{{ item.file.name }}</span>
          <span class="tiptap-image-upload-subtext">
            {{
              item.status === 'uploading'
                ? `${item.progress}%`
                : item.status === 'error'
                  ? '上传失败'
                  : '上传成功'
            }}
          </span>
          <button class="tiptap-image-upload-remove" @click.stop="removeFile(item.id)">×</button>
        </div>
      </div>
    </div>

    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="limit > 1"
      @change="handleChange"
      @click.stop
    />
  </NodeViewWrapper>
</template>
