# 需求

在富文本编辑器中支持图片上传，用户可通过工具栏按钮触发，选择或拖拽图片文件后上传，完成后在光标位置插入可缩放的图片节点。

## 功能需求

- 点击工具栏图片按钮，在光标处插入上传占位区域
- 占位区域支持点击选择文件 和 拖拽文件两种方式触发上传
- 上传过程中显示文件名和进度状态，支持移除单个文件
- 上传成功后，占位区域自动替换为图片节点
- 图片节点支持拖拽边/角 handle 缩放，选中时显示蓝色边框
- 上传逻辑可配置（默认 base64，可替换为服务端上传接口）
- 支持限制文件类型（accept）、最大文件数（limit）、单文件大小（maxSize）
- 选中图片节点时，图片正上方浮现操作工具栏，包含：居左、居中、居右、下载、重新上传、删除

## 验收标准

1. 点击工具栏图片按钮 → 光标处出现拖拽上传区域
2. 点击区域或拖入图片 → 显示文件名 + 进度
3. 上传完成 → 占位节点替换为图片，图片出现在原光标位置
4. 拖拽图片角/边 handle → 图片尺寸实时变化，最小 50×50
5. 选中图片节点 → 显示蓝色 outline（#409eff）
6. 选中上传节点 → 拖拽区域显示蓝色边框
7. 文件超出 maxSize → 触发 onError，不插入节点
8. 选中图片 → 图片正上方居中浮现操作工具栏
9. 点击居左/居中/居右 → 图片对齐方式立即改变，当前对齐按钮高亮
10. 点击下载 → 触发浏览器下载，文件名取自 src 或回退为 image.png
11. 点击重新上传 → 当前图片替换为上传占位节点，触发文件选择
12. 点击删除 → 图片节点从文档中移除

---

## 涉及文件

| 文件 | 状态 | 说明 |
|------|------|------|
| `src/tiptap-extension/ImageUpload.tsx` | ✅ 完成 | 扩展节点定义 |
| `src/tiptap-extension/ImageUploadView.vue` | ✅ 完成 | NodeView 组件 |
| `src/tiptap-extension/ImageWithAlign.ts` | ✅ 完成 | Image 扩展，新增 align 属性 + Decoration 插件 |
| `src/tiptap-ui/ImageButton.tsx` | ✅ 完成 | 工具栏按钮 |
| `src/tiptap-ui/ImageControls.tsx` | ✅ 完成 | 图片选中时浮现的操作工具栏 |
| `src/App.vue` | ✅ 完成 | 编辑器初始化 |
| `src/editor.scss` | ✅ 完成 | 样式 |

---

## 架构：两阶段上传

1. 点击工具栏按钮 → 在光标处插入 `imageUpload` 占位节点
2. 占位节点渲染拖拽上传 UI，用户选文件后执行上传
3. 上传成功 → 删除占位节点，替换为真正的 `image` 节点（支持缩放）

`Image` 扩展（渲染/缩放）与 `ImageUpload` 扩展（上传 UI）职责分离。

---

## ImageUpload.tsx

独立 `Node.create<ImageUploadOptions>`，不继承 Image 扩展。

**Options：**
| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string \| NodeType` | `'image'` | 上传成功后插入的节点类型 |
| `accept` | `string` | `'image/*'` | 文件选择器过滤 |
| `limit` | `number` | `1` | 最大文件数 |
| `maxSize` | `number` | `0` | 最大文件大小（字节，0 为不限制） |
| `upload` | `(file) => Promise<string>` | FileReader base64 | 上传函数 |
| `onError` | `(error) => void` | - | 错误回调 |
| `onSuccess` | `(url) => void` | - | 成功回调 |
| `HTMLAttributes` | `Record<string, any>` | `{}` | HTML 属性 |

**关键实现：**
- `atom: true`、`selectable: true`、`draggable: true`、`group: 'block'`
- `addAttributes()`：将 accept/limit/maxSize 存入节点属性，NodeView 从 `props.node.attrs` 读取
- `addNodeView()`：`VueNodeViewRenderer(ImageUploadView)`
- `addCommands()`：`setImageUploadNode` → `commands.insertContent({ type: this.name })`
- `addKeyboardShortcuts()`：Enter 键触发已选中的上传节点点击（通过 `editor.view.nodeDOM` 找到 DOM 并调用 `.click()`）
- `declare module '@tiptap/core'`：扩展 `Commands` 接口声明 `setImageUploadNode`

---

## ImageUploadView.vue

Vue NodeView 组件，使用 `nodeViewProps` + `NodeViewWrapper`。

**状态：**
- 无文件：显示拖拽区域，支持 dragover/drop，点击触发隐藏 `<input type="file">`
- 上传中：显示文件列表 + 进度，可移除单个文件（`status: 'uploading' | 'success' | 'error'`）
- 上传成功：调用 `editor.chain().focus().deleteRange(...).insertContentAt(pos, imageNodes).run()` 替换占位节点

**上传逻辑：**
- 从 `props.extension.options.upload` 读取上传函数
- maxSize > 0 时校验文件大小
- files.length > limit 时拒绝并报错
- 上传结果通过 `onSuccess` / `onError` 回调透出
- 替换节点：`imageNodes = urls.map(src => ({ type: 'image', attrs: { src } }))`，通过 `props.getPos()` 定位占位节点位置，单一 chain 完成 deleteRange + insertContentAt

---

## ImageButton.tsx

注入 editor，点击时调用 `editor.commands.setImageUploadNode()`。

---

## ImageWithAlign.ts

`Image.extend()` 扩展，新增 `align` 属性（默认 `'left'`）。

**addAttributes()：**
- `parseHTML`：读取 `data-align` 属性
- `renderHTML`：输出 `{ 'data-align': align }` 用于 HTML 序列化

**addProseMirrorPlugins()：**

使用 `Decoration.node` 将 `data-align` 注入到 NodeView 的根元素（`[data-resize-container]`）。这是必要的，因为 ResizableNodeView 不会自动将 `renderHTML` 的输出应用到 DOM，只有通过 Decoration 才能可靠地将属性写入 NodeView 根元素。

```ts
new Plugin({
  props: {
    decorations(state) {
      const decorations: Decoration[] = []
      state.doc.descendants((node, pos) => {
        if (node.type.name === name && node.attrs.align) {
          decorations.push(Decoration.node(pos, pos + node.nodeSize, { 'data-align': node.attrs.align }))
        }
      })
      return DecorationSet.create(state.doc, decorations)
    },
  },
})
```

---

## ImageControls.tsx

参考 `TableControls.tsx` 实现，注入 editor，挂载在 `App.vue` 的 `.tiptap-editor` 内。

**触发条件：** `editor.isActive('image')` 且 selection 为 `NodeSelection`

**定位：**
- `info.value` 只存储 `pos / nodeSize / src / align`（不存 rect）
- 渲染函数每次调用时实时获取 `editor.view.nodeDOM(pos)` → `[data-resize-wrapper]` → `getBoundingClientRect()`，避免图片加载前坐标错误
- 工具栏使用 `transform: translate(-50%, calc(-100% - 8px))` 定位在图片正上方 8px 处

**按钮：**

| 按钮 | 图标 | 操作 |
|------|------|------|
| 居左 | `AlignLeftIcon` | `chain().focus().updateAttributes('image', { align: 'left' }).run()` |
| 居中 | `AlignCenterIcon` | `chain().focus().updateAttributes('image', { align: 'center' }).run()` |
| 居右 | `AlignRightIcon` | `chain().focus().updateAttributes('image', { align: 'right' }).run()` |
| 下载 | 内联 SVG（下载箭头） | 创建 `<a download>` 触发下载，base64 回退文件名为 `image.png` |
| 重新上传 | 内联 SVG（旋转箭头） | `chain().focus().deleteRange(...).insertContentAt(pos, { type: 'imageUpload' }).run()` |
| 删除 | 内联 SVG（垃圾桶） | `chain().focus().deleteRange(pos, pos+nodeSize).run()` |

当前对齐按钮根据 `node.attrs.align` 高亮（`is-active` class）。所有按钮 `onMousedown` 调用 `e.preventDefault()` 防止编辑器失去选区焦点。

---

## App.vue

分别注册三个扩展：

```ts
ImageWithAlign.configure({
  allowBase64: true,
  resize: {
    enabled: true,
    directions: ['top', 'right', 'bottom', 'left', 'top-right', 'top-left', 'bottom-right', 'bottom-left'],
    minWidth: 50,
    minHeight: 50,
    alwaysPreserveAspectRatio: false,
  },
}),
ImageUpload,
```

模板中在 `.tiptap-editor` 内挂载 `<ImageControls />`。

---

## editor.scss

### resize handles
在 `.tiptap .ProseMirror-selectednode` 下，按 `[data-resize-handle]` 方向分别设置位置、尺寸、cursor。角 handle 为 8px×8px，边 handle 为 6px 宽/高。

### img pointer-events
```scss
[data-resize-wrapper] img { pointer-events: none; user-select: none; }
```
`<img>` 默认捕获鼠标事件，导致覆盖在其上的 handles 无法响应 `mousedown`，必须禁用。

### 图片选中边框
```scss
.ProseMirror-selectednode [data-resize-wrapper] { outline: 2px solid #409eff; }
```
targeting `[data-resize-wrapper]` 而非 `img`，因为 resize 启用时 img 被包裹在 wrapper 内。

### 图片对齐
ResizableNodeView 的 DOM 结构：
```
[data-resize-container]  ← NodeView 根元素，display: flex，Decoration 注入 data-align
  [data-resize-wrapper]  ← 图片 + resize handles，宽高与图片相同
    <img>
    [data-resize-handle="..."]
```

`data-align` 由 `ImageWithAlign` 的 `Decoration.node` 注入到 `[data-resize-container]`（NodeView 根元素）。由于容器本身是 `display: flex` 且全宽，直接用 `justify-content` 对齐内部 wrapper：

```scss
[data-resize-container][data-align='center'] { justify-content: center; }
[data-resize-container][data-align='right']  { justify-content: flex-end; }
```

### 上传区域
`.tiptap-image-upload`：拖拽虚线边框、drag-active 状态（border-color: #409eff，background: #ecf5ff）、上传进度条（absolute 定位）、文件预览列表。
`.ProseMirror-selectednode .tiptap-image-upload-drag-area`：节点选中时显示蓝色边框。

### 图片操作工具栏
`.image-controls`：absolute 定位，白色背景圆角胶囊（border-radius: 9999px），box-shadow，padding: 4px 8px，flex 排列按钮，gap: 2px。

`.image-controls-btn`：28×28px 透明按钮，hover 背景 #f5f5f5，`is-active` 时背景 #e8f4ff、颜色 #409eff。
`.image-controls-separator`：1px 竖线，高 16px，背景 #e4e7ed，margin: 0 4px。
