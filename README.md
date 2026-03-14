# Tiptap Vue 富文本编辑器

## 技术栈
- vue 3.5.25
- element-plus 2.13.3
- @tiptap/core 3.20.0

## 代码结构
```
src/
├── App.vue                   # 初始化编辑器，渲染工具栏 + 编辑器内容
├── editor.scss               # 工具栏和编辑器样式
├── components/
│   └── IconButton.tsx        # 基础按钮，包裹 ElButton 和 ElTooltip
├── tiptap-ui/                # 工具栏按钮组
│   ├── UndoRedoButton.tsx    # 撤销重做
│   ├── TextStyleButton.tsx   # 加粗、斜体、删除线、下划线、链接
│   ├── TextAlignButton.tsx   # 左边对齐、中间对齐、右边对齐、两端对齐
│   ├── ListButton.tsx        # 无序列表、有序列表、任务列表
│   └── ImageButton.tsx       # 图片上传
├── tiptap-icons/             # SVG 图标组件 (TSX)
└── tiptap-extension/         # Tiptap extensions
``` 