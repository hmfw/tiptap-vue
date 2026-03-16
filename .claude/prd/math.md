# 需求
集成 `@tiptap/extension-mathematics`，在工具栏添加数学图标，实现编辑器支持数学公式（行内/块级），支持点击公式弹框编辑、实时预览。

---

# 方案

基于 KaTeX 渲染 LaTeX 数学公式。通过 `Mathematics.configure` 的 `onClick` 钩子触发编辑弹框，新增/编辑共用同一个 `MathEditDialog`，弹框通过 `provide/inject` 共享打开方法。

## 关键文件

| 文件 | 操作 |
|------|------|
| `src/tiptap-icons/MathIcon.tsx` | 已存在，无需修改 |
| `src/tiptap-ui/MathButton.tsx` | 新建，注入 `openMathDialog` |
| `src/tiptap-ui/MathEditDialog.vue` | 新建，插入/编辑/预览弹框 |
| `src/App.vue` | 注册扩展、provide 状态和方法、添加工具栏按钮 |
| `src/editor.scss` | 添加公式节点 hover 样式 |

## 注意事项

- 扩展命令名：`insertInlineMath` / `insertBlockMath` / `updateInlineMath` / `updateBlockMath` / `deleteInlineMath` / `deleteBlockMath`
- 节点名：`inlineMath` / `blockMath`（非 `mathInline`）
- 编辑时切换类型：需先 `delete` 旧节点再 `insert` 新类型节点

---

# 实现步骤

## 1. 安装依赖

```bash
pnpm add @tiptap/extension-mathematics katex
```

## 2. 新建 `src/tiptap-ui/MathButton.tsx`

注入 `openMathDialog`，点击时打开插入弹框：

```tsx
const openMathDialog = inject<(opts?: {...}) => void>('openMathDialog')

<IconButton
  icon={MathIcon}
  tooltip="数学公式"
  isActive={editor?.value?.isActive('inlineMath') || editor?.value?.isActive('blockMath')}
  onClick={() => openMathDialog?.()}
/>
```

## 3. 新建 `src/tiptap-ui/MathEditDialog.vue`

- Props：`visible`、`latex`、`pos`（null = 新增模式）、`type`（`'inline' | 'block'`）
- 功能：行内/块级 Radio 切换、LaTeX textarea 输入、KaTeX 实时预览
- 确认逻辑：
  - 新增 → `insertInlineMath` / `insertBlockMath`
  - 编辑且类型不变 → `updateInlineMath` / `updateBlockMath`
  - 编辑且类型改变 → `deleteInlineMath/deleteBlockMath` + `insertBlockMath/insertInlineMath`

```ts
const preview = computed(() =>
  editLatex.value.trim()
    ? katex.renderToString(editLatex.value, { displayMode: editType.value === 'block', throwOnError: false })
    : ''
)
```

## 4. 修改 `src/App.vue`

```ts
import { Mathematics } from '@tiptap/extension-mathematics'
import 'katex/dist/katex.min.css'
import MathButton from './tiptap-ui/MathButton'
import MathEditDialog from './tiptap-ui/MathEditDialog.vue'

// 响应式状态
const mathEditVisible = ref(false)
const mathEditLatex = ref('')
const mathEditPos = ref<number | null>(null)
const mathEditType = ref<'inline' | 'block'>('inline')

// 共享打开方法
const openMathDialog = (opts = {}) => { /* 设置状态并打开 */ }
provide('openMathDialog', openMathDialog)

// 扩展配置
Mathematics.configure({
  inlineOptions: { onClick: (node, pos) => openMathDialog({ latex: node.attrs.latex, pos, type: 'inline' }) },
  blockOptions:  { onClick: (node, pos) => openMathDialog({ latex: node.attrs.latex, pos, type: 'block' }) },
})
```

工具栏末尾：
```html
<div class="tiptap-separator"></div>
<MathButton />
```
模板末尾：
```html
<MathEditDialog v-model:visible="mathEditVisible" :latex="mathEditLatex" :pos="mathEditPos" :type="mathEditType" />
```

## 5. `src/editor.scss` 添加公式节点样式

```scss
.tiptap-mathematics-render {
  padding: 0 0.25rem;
  border-radius: 0.25rem;

  &--editable {
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: #eee; }
  }

  &[data-type='inline-math'] { display: inline-block; }
  &[data-type='block-math'] { display: block; margin: 1rem 0; padding: 1rem; text-align: center; }
}
```
