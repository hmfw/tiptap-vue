查阅 @README.md 以了解项目概述

## 开发规范
- 项目运行在 http://localhost:5174
- 在进行 TypeScript 更改后，始终运行 `npm run build` 或项目的类型检查命令，以便在提交前捕获类型错误。
- 在使用 Tiptap 扩展时，在编写 import 语句之前，始终检查已安装的包版本及其实际的导出路径。不要假设导入路径——先在 node_modules 或包文档中进行验证。
- 本项目使用 Vue 3 和 TypeScript。编辑器基于 Tiptap (ProseMirror) 构建。使用 `provide/inject` 共享编辑器状态。始终验证 Vue 指令的使用是否避免了运行时警告（例如，在组件上使用自定义指令时使用包装元素）。
- 当用户提供 PRD 文档或引用它时，将其视为功能需求的唯一真实来源。当功能实现后，更新 PRD 以反映完成状态。