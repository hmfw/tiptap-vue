# 需求
工具栏增加表格图标，点击后弹出行列选择器，支持自定义插入表格的行列数。

## 实现

### 新增文件
- `src/tiptap-icons/TableIcon.tsx` - 表格 SVG 图标
- `src/tiptap-ui/TableButton.tsx` - 表格工具栏按钮

### 修改文件
- `src/App.vue` - 注册 Table 扩展，添加 `<TableButton />` 到工具栏
- `src/editor.scss` - 添加表格样式、行列选择器样式

### 依赖
- 安装 `@tiptap/extension-table`（包含 Table / TableRow / TableHeader / TableCell）

## TableButton 交互
- 点击按钮弹出 `ElPopover`（无箭头，`click` 触发）
- 弹窗内展示 8×8 格子网格
- 鼠标悬停时从左上角到当前格高亮（紫色）
- 底部状态栏实时显示当前选中的列数 × 行数（带图标）
- 点击格子插入对应行列数的表格（带表头行），弹窗关闭

## 表格样式
- 单线合并边框（`border-collapse: collapse`）
- 表头加粗 + 浅灰背景
- 选中单元格淡蓝色高亮（`.selectedCell`）
- 支持列宽拖拽（`.column-resize-handle`）
- 横向溢出滚动（`.tableWrapper`）
