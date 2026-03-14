# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 命令

```bash
pnpm dev        # 启动开发服务器 http://localhost:5173
pnpm build      # 类型检查（vue-tsc）后构建生产包
pnpm preview    # 预览生产构建
```

无测试框架。

## 架构

Vue 3 + TypeScript + Vite 的 Tiptap 富文本编辑器，使用 pnpm 管理包。

**核心依赖**：Tiptap 3.x（`@tiptap/core`、`@tiptap/vue-3`、`@tiptap/starter-kit`、`@tiptap/extensions`、各 `@tiptap/extension-*`）、Element Plus 2.x（UI 组件，通过 `unplugin-element-plus` 自动导入）。

### 编辑器实例共享

`App.vue` 用 `useEditor()` 创建编辑器，通过 `provide('editor', editor)` 注入。各工具栏组件用 `inject<ShallowRef<Editor | undefined>>('editor')` 获取实例。

### 组件约定

- `.vue` 文件用 `<script setup>` + TypeScript
- 工具栏组件（`tiptap-ui/`、`components/`、`tiptap-icons/`）均用 `defineComponent` + JSX 渲染函数（`.tsx`）
- `IconButton.tsx` 是所有工具栏按钮的基础组件，支持 `onClick`、`disabled`、`isActive` props
- SVG 图标统一放在 `tiptap-icons/`，用 `fill="currentColor"` 支持主题色

### TypeScript

strict 模式开启，未使用的变量/参数会报错。
