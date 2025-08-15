import { useEffect, useMemo, useState } from 'react'

import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useDebounce } from '@uidotdev/usehooks'
import { useForm } from 'react-hook-form'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'
import { FormCheckbox } from '@/components/form/form-checkbox'
import { FormDatePicker } from '@/components/form/form-date-picker'
import { FormSelect } from '@/components/form/form-select'
import {
  ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type EditableColumnDef<TData, TValue = unknown> = ColumnDef<
  TData,
  TValue
> & {
  enableFilter?: boolean
  editable?: boolean
  editType?: 'text' | 'select' | 'checkbox' | 'date'
  editOptions?: { value: string | number; label: string }[]
}

interface EditableDataTableProps<TData> {
  columns: EditableColumnDef<TData>[]
  data: TData[]
  totalItems: number
  totalItemsLabel: string
  onRowUpdate?: (rowIndex: number, data: TData) => void
  isEditing?: boolean
}

interface EditingCell {
  rowIndex: number
  columnId: string
}

export function EditableDataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  totalItems,
  totalItemsLabel,
  onRowUpdate,
  isEditing = false,
}: EditableDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [filteredItemsCount, setFilteredItemsCount] = useState<number>(0)
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)

  const debouncedData = useDebounce(data, 1000)
  const memoizedColumns = useMemo(() => columns, [columns])

  const table = useReactTable({
    data: debouncedData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    const filteredRows = table.getFilteredRowModel().rows
    setFilteredItemsCount(filteredRows.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedData, columnFilters, sorting, table.getFilteredRowModel().rows])

  const handleCellEdit = (rowIndex: number, columnId: string) => {
    if (!isEditing) return
    setEditingCell({ rowIndex, columnId })
  }

  const handleCellSave = (
    rowIndex: number,
    columnId: string,
    value: unknown,
  ) => {
    const updatedData = [...data]
    const currentRow = updatedData[rowIndex]

    // Se o columnId contém um ponto, significa que é um campo aninhado
    if (columnId.includes('.')) {
      const [parent, child] = columnId.split('.')
      const parentValue = currentRow[parent] || {}
      updatedData[rowIndex] = {
        ...currentRow,
        [parent]: {
          ...parentValue,
          [child]: value,
        },
      }
    } else {
      updatedData[rowIndex] = {
        ...currentRow,
        [columnId]: value,
      }
    }

    onRowUpdate?.(rowIndex, updatedData[rowIndex])
    setEditingCell(null)
  }

  const EditableCell = ({
    row,
    column,
  }: {
    row: Row<TData>
    column: Column<TData>
  }) => {
    const columnDef = column.columnDef as EditableColumnDef<TData>
    const isEditing =
      editingCell?.rowIndex === row.index && editingCell?.columnId === column.id
    const value = row.getValue(column.id)

    const form = useForm({
      defaultValues: {
        [column.id]: value,
      },
    })

    const [localValue, setLocalValue] = useState(value)

    // Atualiza o valor local quando o valor da linha muda
    useEffect(() => {
      setLocalValue(value)
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      handleCellSave(row.index, column.id, newValue)
    }

    if (!columnDef.editable || !isEditing) {
      const cell = row
        .getVisibleCells()
        .find((cell) => cell.column.id === column.id)
      if (!cell) return null
      return flexRender(column.columnDef.cell, cell.getContext())
    }

    switch (columnDef.editType) {
      case 'select':
        return (
          <FormSelect
            form={form}
            fields={{
              name: column.id,
              label: '',
              icon: 'chevronsUpDown',
              placeholder: 'Selecione...',
              options: columnDef.editOptions || [],
            }}
          />
        )
      case 'checkbox':
        return (
          <FormCheckbox
            form={form}
            fields={{
              name: column.id,
              label: '',
              description: '',
            }}
          />
        )
      case 'date':
        return (
          <FormDatePicker
            form={form}
            fields={{
              name: column.id,
              label: '',
            }}
          />
        )
      default:
        return (
          <input
            type="text"
            value={localValue as string}
            onChange={handleInputChange}
            onBlur={() => setEditingCell(null)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
            autoFocus
          />
        )
    }
  }

  return (
    <div className="overflow-auto">
      <div className="flex w-full items-center justify-between space-y-2 py-4">
        <div className="text-sm text-zinc-700 dark:text-zinc-200">
          {totalItemsLabel}: {filteredItemsCount} de {totalItems}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded bg-zinc-50 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50">
        <ShadcnTable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <TableRow key={headerGroup.id ?? `headerGroup-${index}`}>
                {headerGroup.headers.map((header, headerIndex) => (
                  <TableHead
                    key={header.id ?? `header-${headerIndex}`}
                    className="text-zinc-900 dark:text-zinc-50"
                  >
                    <DataTableColumnHeader
                      column={header.column}
                      title={header.column.columnDef.header as string}
                      enableFilter={
                        (header.column.columnDef as EditableColumnDef<TData>)
                          .enableFilter ?? true
                      }
                    />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id ?? `row-${index}`}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-center text-zinc-900 dark:text-zinc-200"
                      onClick={() => {
                        const columnDef = cell.column
                          .columnDef as EditableColumnDef<TData>
                        if (columnDef.editable) {
                          handleCellEdit(row.index, cell.column.id)
                        }
                      }}
                    >
                      <EditableCell row={row} column={cell.column} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-zinc-700 dark:text-zinc-200"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ShadcnTable>
      </div>
    </div>
  )
}
