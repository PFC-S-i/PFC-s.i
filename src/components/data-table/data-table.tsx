import { useEffect, useMemo, useState } from 'react'

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useDebounce } from '@uidotdev/usehooks'

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'
import {
  ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type CustomColumnDef<TData, TValue = unknown> = ColumnDef<
  TData,
  TValue
> & {
  enableFilter?: boolean
}

interface DataTableProps<TData> {
  columns: CustomColumnDef<TData>[]
  data: TData[]
  totalItems: number
  totalItemsLabel: string
  defaultMessageNoResults?: string
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  totalItems,
  totalItemsLabel,
  defaultMessageNoResults = 'Sem resultados.',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [filteredItemsCount, setFilteredItemsCount] = useState<number>(0)

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
                        (header.column.columnDef as CustomColumnDef<TData>)
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
              table.getRowModel().rows.map((row, index) => {
                const currentQuantity = Number(
                  row.original.current_quantity,
                ) as number
                const iappQuantity = Number(
                  row.original.iapp_quantity,
                ) as number
                const isNew = row.original.is_new

                const rowClassName = isNew
                  ? 'bg-red-500'
                  : currentQuantity === 0 ||
                      currentQuantity === null ||
                      Number.isNaN(currentQuantity) ||
                      iappQuantity === 0 ||
                      iappQuantity === null ||
                      Number.isNaN(iappQuantity)
                    ? 'bg-zinc-800'
                    : currentQuantity > iappQuantity
                      ? 'bg-red-500'
                      : 'bg-blue-500'

                return (
                  <TableRow
                    key={row.id ?? `row-${index}-${Math.random()}`}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    className={rowClassName}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-center text-zinc-900 dark:text-zinc-200"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-zinc-700 dark:text-zinc-200"
                >
                  {defaultMessageNoResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ShadcnTable>
      </div>
    </div>
  )
}
