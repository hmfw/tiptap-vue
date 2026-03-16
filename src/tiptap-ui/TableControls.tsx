import { defineComponent, inject, ref, watchEffect, type Ref } from 'vue'
import type { Editor } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'

interface CellInfo {
  cell: HTMLElement
  colIndex: number
  rowIndex: number
  totalCols: number
  totalRows: number
  cellRect: DOMRect
  tableRect: DOMRect
  editorRect: DOMRect
}

function findCellElement(node: Node): HTMLElement | null {
  let el: Node | null = node.nodeType === Node.TEXT_NODE ? node.parentElement : node
  while (el && el instanceof HTMLElement) {
    if (el.tagName === 'TD' || el.tagName === 'TH') return el
    el = el.parentElement
  }
  return null
}

function getCellInfo(editor: Editor): CellInfo | null {
  if (!editor.isActive('tableCell') && !editor.isActive('tableHeader')) return null

  const { node } = editor.view.domAtPos(editor.state.selection.from)
  const cell = findCellElement(node)
  if (!cell) return null

  const row = cell.parentElement as HTMLTableRowElement
  const tbody = row.parentElement as HTMLElement
  const tableEl = cell.closest('table') as HTMLElement
  if (!tableEl) return null

  const colIndex = Array.from(row.children).indexOf(cell)
  const rowIndex = Array.from(tbody.children).indexOf(row)
  const totalCols = row.children.length
  const totalRows = tbody.children.length

  const cellRect = cell.getBoundingClientRect()
  const tableRect = tableEl.getBoundingClientRect()
  const editorRect = editor.view.dom.closest('.tiptap-editor')!.getBoundingClientRect()

  return { cell, colIndex, rowIndex, totalCols, totalRows, cellRect, tableRect, editorRect }
}

function findTableNode(editor: Editor): { node: PMNode; pos: number } | null {
  const { state } = editor
  const from = state.selection.from
  let result: { node: PMNode; pos: number } | null = null

  state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
    if (node.type.name === 'table') {
      if (pos <= from && from <= pos + node.nodeSize) {
        result = { node, pos }
        return false
      }
    }
  })

  return result
}

export default defineComponent({
  name: 'TableControls',
  setup() {
    const editor = inject<Ref<Editor | undefined>>('editor')
    const info = ref<CellInfo | null>(null)
    const prevCell = ref<HTMLElement | null>(null)

    function updateControls() {
      const ed = editor?.value
      // Remove class from previous cell
      if (prevCell.value) {
        prevCell.value.classList.remove('tcc-cell-focused')
        prevCell.value = null
      }
      if (!ed) {
        info.value = null
        return
      }
      const newInfo = getCellInfo(ed)
      info.value = newInfo
      if (newInfo) {
        newInfo.cell.classList.add('tcc-cell-focused')
        prevCell.value = newInfo.cell
      }
    }

    watchEffect((cleanup) => {
      const ed = editor?.value
      if (!ed) return
      ed.on('selectionUpdate', updateControls)
      ed.on('transaction', updateControls)
      cleanup(() => {
        ed.off('selectionUpdate', updateControls)
        ed.off('transaction', updateControls)
        if (prevCell.value) {
          prevCell.value.classList.remove('tcc-cell-focused')
          prevCell.value = null
        }
      })
    })

    function moveColumn(dir: 'left' | 'right') {
      const ed = editor?.value
      if (!ed || !info.value) return
      const { colIndex, totalCols } = info.value
      const targetIdx = dir === 'left' ? colIndex - 1 : colIndex + 1
      if (targetIdx < 0 || targetIdx >= totalCols) return

      const tableInfo = findTableNode(ed)
      if (!tableInfo) return
      const { node: tNode, pos: tablePos } = tableInfo

      const newRows: PMNode[] = []
      tNode.forEach((rowNode) => {
        if (rowNode.type.name !== 'tableRow') {
          newRows.push(rowNode)
          return
        }
        const cells: PMNode[] = []
        rowNode.forEach((cell) => cells.push(cell))
        const tmp = cells[colIndex]!
        cells[colIndex] = cells[targetIdx]!
        cells[targetIdx] = tmp
        newRows.push(rowNode.type.create(rowNode.attrs, cells, rowNode.marks))
      })

      const newTable = tNode.type.create(tNode.attrs, newRows, tNode.marks)
      const tr = ed.state.tr.replaceWith(tablePos, tablePos + tNode.nodeSize, newTable)
      ed.view.dispatch(tr)
    }

    function moveRow(dir: 'up' | 'down') {
      const ed = editor?.value
      if (!ed || !info.value) return
      const { rowIndex, totalRows } = info.value
      const targetIdx = dir === 'up' ? rowIndex - 1 : rowIndex + 1
      if (targetIdx < 0 || targetIdx >= totalRows) return

      const tableInfo = findTableNode(ed)
      if (!tableInfo) return
      const { node: tNode, pos: tablePos } = tableInfo

      const rows: PMNode[] = []
      tNode.forEach((row) => rows.push(row))
      const tmp = rows[rowIndex]!
      rows[rowIndex] = rows[targetIdx]!
      rows[targetIdx] = tmp

      const newTable = tNode.type.create(tNode.attrs, rows, tNode.marks)
      const tr = ed.state.tr.replaceWith(tablePos, tablePos + tNode.nodeSize, newTable)
      ed.view.dispatch(tr)
    }

    const DotsHIcon = () => (
      <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor">
        <circle cx="2" cy="2" r="1.5" />
        <circle cx="8" cy="2" r="1.5" />
        <circle cx="14" cy="2" r="1.5" />
      </svg>
    )

    const DotsVIcon = () => (
      <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
        <circle cx="2" cy="2" r="1.5" />
        <circle cx="2" cy="8" r="1.5" />
        <circle cx="2" cy="14" r="1.5" />
      </svg>
    )

    const PlusIcon = () => (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <path d="M5 1v8M1 5h8" />
      </svg>
    )

    return () => {
      const i = info.value
      if (!i) return null

      const { colIndex, rowIndex, totalCols, totalRows, cellRect, tableRect, editorRect } = i

      const tTop = tableRect.top - editorRect.top
      const tLeft = tableRect.left - editorRect.left
      const tRight = tableRect.right - editorRect.left
      const tBottom = tableRect.bottom - editorRect.top
      const cLeft = cellRect.left - editorRect.left
      const cTop = cellRect.top - editorRect.top
      const cW = cellRect.width
      const cH = cellRect.height

      // Column button: above the table, centered on the focused column
      const colBtnStyle = {
        position: 'absolute' as const,
        top: `${tTop - 24}px`,
        left: `${cLeft + cW / 2 - 18}px`,
      }
      // Row button: left of the table, centered on the focused row
      const rowBtnStyle = {
        position: 'absolute' as const,
        top: `${cTop + cH / 2 - 18}px`,
        left: `${tLeft - 26}px`,
      }
      // Add column button: right of the table, centered on focused row
      const addColBtnStyle = {
        position: 'absolute' as const,
        top: `${cTop + cH / 2 - 12}px`,
        left: `${tRight + 6}px`,
      }
      // Add row button: below the table, centered on focused column
      const addRowBtnStyle = {
        position: 'absolute' as const,
        top: `${tBottom + 6}px`,
        left: `${cLeft + cW / 2 - 12}px`,
      }

      const isFirstCol = colIndex === 0
      const isLastCol = colIndex === totalCols - 1
      const isFirstRow = rowIndex === 0
      const isLastRow = rowIndex === totalRows - 1

      const ed = editor?.value

      return (
        <div class="table-cell-controls">
          {/* Column controls button */}
          <ElDropdown
            trigger="click"
            placement="bottom"
            style={colBtnStyle}
            onCommand={(cmd: string) => {
              if (cmd === 'move-left') moveColumn('left')
              else if (cmd === 'move-right') moveColumn('right')
              else if (cmd === 'insert-left') ed?.chain().focus().addColumnBefore().run()
              else if (cmd === 'insert-right') ed?.chain().focus().addColumnAfter().run()
              else if (cmd === 'delete') ed?.chain().focus().deleteColumn().run()
            }}
            v-slots={{
              dropdown: () => (
                <ElDropdownMenu>
                  <ElDropdownItem command="move-left" disabled={isFirstCol}>
                    移动列到左侧
                  </ElDropdownItem>
                  <ElDropdownItem command="move-right" disabled={isLastCol}>
                    移动列到右侧
                  </ElDropdownItem>
                  <ElDropdownItem command="insert-left">在左侧插入一列</ElDropdownItem>
                  <ElDropdownItem command="insert-right">在右侧插入一列</ElDropdownItem>
                  <ElDropdownItem command="delete" divided>
                    删除列
                  </ElDropdownItem>
                </ElDropdownMenu>
              ),
            }}
          >
            <button class="tcc-btn tcc-btn--col">
              <DotsHIcon />
            </button>
          </ElDropdown>

          {/* Row controls button */}
          <ElDropdown
            trigger="click"
            placement="right"
            style={rowBtnStyle}
            onCommand={(cmd: string) => {
              if (cmd === 'move-up') moveRow('up')
              else if (cmd === 'move-down') moveRow('down')
              else if (cmd === 'insert-above') ed?.chain().focus().addRowBefore().run()
              else if (cmd === 'insert-below') ed?.chain().focus().addRowAfter().run()
              else if (cmd === 'delete') ed?.chain().focus().deleteRow().run()
            }}
            v-slots={{
              dropdown: () => (
                <ElDropdownMenu>
                  <ElDropdownItem command="move-up" disabled={isFirstRow}>
                    上移
                  </ElDropdownItem>
                  <ElDropdownItem command="move-down" disabled={isLastRow}>
                    下移
                  </ElDropdownItem>
                  <ElDropdownItem command="insert-above">在上方插入一行</ElDropdownItem>
                  <ElDropdownItem command="insert-below">在下方插入一行</ElDropdownItem>
                  <ElDropdownItem command="delete" divided>
                    删除行
                  </ElDropdownItem>
                </ElDropdownMenu>
              ),
            }}
          >
            <button class="tcc-btn tcc-btn--row">
              <DotsVIcon />
            </button>
          </ElDropdown>

          {/* Add column button (rightmost cell) */}
          {isLastCol && (
            <button
              class="tcc-btn tcc-btn--add"
              style={addColBtnStyle}
              onClick={() => ed?.chain().focus().addColumnAfter().run()}
            >
              <PlusIcon />
            </button>
          )}

          {/* Add row button (bottommost cell) */}
          {isLastRow && (
            <button
              class="tcc-btn tcc-btn--add"
              style={addRowBtnStyle}
              onClick={() => ed?.chain().focus().addRowAfter().run()}
            >
              <PlusIcon />
            </button>
          )}
        </div>
      )
    }
  },
})
