import { Column } from '@tanstack/react-table'

import { Input } from '@/components/input'

interface ColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>
}

export function ColumnFilter<TData, TValue>({
  column,
}: ColumnFilterProps<TData, TValue>) {
  return (
    <Input
      icon="search"
      placeholder="Buscar..."
      className="h-8"
      value={(column.getFilterValue() as string) ?? ''}
      onChange={(e) => column.setFilterValue(e.target.value)}
    />
  )
}
