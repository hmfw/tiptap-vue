import { defineComponent, inject, ref, type Ref } from 'vue'
import type { Editor } from '@tiptap/core'
import { ElPopover, ElButton, ElTooltip } from 'element-plus'
import TableIcon from '../tiptap-icons/TableIcon'

const COLS = 8
const ROWS = 8

const ColsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="2" width="3" height="12" rx="1" />
    <rect x="6" y="2" width="3" height="12" rx="1" />
    <rect x="11" y="2" width="3" height="12" rx="1" />
  </svg>
)

const RowsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="2" y="1" width="12" height="3" rx="1" />
    <rect x="2" y="6" width="12" height="3" rx="1" />
    <rect x="2" y="11" width="12" height="3" rx="1" />
  </svg>
)

export default defineComponent({
  name: 'TableButton',
  setup() {
    const editor = inject<Ref<Editor | undefined>>('editor')
    const visible = ref(false)
    const hoverCol = ref(0)
    const hoverRow = ref(0)

    const onCellHover = (col: number, row: number) => {
      hoverCol.value = col
      hoverRow.value = row
    }

    const onGridLeave = () => {
      hoverCol.value = 0
      hoverRow.value = 0
    }

    const onCellClick = (col: number, row: number) => {
      editor?.value
        ?.chain()
        .focus()
        .insertTable({ rows: row, cols: col, withHeaderRow: true })
        .run()
      visible.value = false
    }

    return () => (
      <ElTooltip content="表格" showArrow={false} offset={6} disabled={visible.value}>
        <ElPopover
          v-model:visible={visible.value}
          trigger="click"
          placement="bottom-start"
          popperClass="table-picker-popper"
          width="auto"
          showArrow={false}
          v-slots={{
            reference: () => (
              <ElButton
                text
                class={['tiptap-button', { 'is-active': visible.value }]}
              >
                <TableIcon class="tiptap-button-icon" />
              </ElButton>
            ),
            default: () => (
              <div class="table-picker">
                <div class="table-picker-grid" onMouseleave={onGridLeave}>
                  {Array.from({ length: ROWS }, (_, r) => (
                    <div key={r} class="table-picker-row">
                      {Array.from({ length: COLS }, (_, c) => (
                        <div
                          key={c}
                          class={[
                            'table-picker-cell',
                            { 'is-active': c < hoverCol.value && r < hoverRow.value },
                          ]}
                          onMouseenter={() => onCellHover(c + 1, r + 1)}
                          onClick={() => onCellClick(c + 1, r + 1)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div class="table-picker-footer">
                  <div class="table-picker-counter">
                    <ColsIcon />
                    <span>{hoverCol.value || 1}</span>
                  </div>
                  <span class="table-picker-x">x</span>
                  <div class="table-picker-counter">
                    <RowsIcon />
                    <span>{hoverRow.value || 1}</span>
                  </div>
                </div>
              </div>
            ),
          }}
        />
      </ElTooltip>
    )
  },
})
