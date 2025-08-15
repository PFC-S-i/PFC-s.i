import { Column } from '@tanstack/react-table'

import { Button } from '@/components/button'
import { ColumnFilter } from '@/components/data-table/filters/column-filter'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { icons } from '@/utils/icons'

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  enableFilter?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  enableFilter = true,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  return (
    <div
      className={cn(
        'my-2 flex flex-col items-center justify-center',
        className,
      )}
      {...props}
    >
      {enableFilter ? (
        <>
          <ColumnHeader column={column} title={title} />

          <ColumnFilter column={column} />
        </>
      ) : (
        <span>{title}</span>
      )}
    </div>
  )
}

function ColumnHeader<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>
  title: string
}) {
  const ArrowDown = icons.arrowDown
  const ArrowUp = icons.arrowUp
  const ChevronsUpDown = icons.chevronsUpDown
  const EyeOff = icons.eyeOff

  return (
    <div className="flex w-full min-w-40 items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full data-[state=open]:bg-zinc-800/90"
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <div className="ml-2">
                <ArrowDown />
              </div>
            ) : column.getIsSorted() === 'asc' ? (
              <div className="ml-2">
                <ArrowUp />
              </div>
            ) : (
              <div className="ml-2">
                <ChevronsUpDown />
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <div className="mr-2 h-3.5 w-3.5 text-muted-foreground/70">
              <ArrowUp />
            </div>
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <div className="mr-2 h-3.5 w-3.5 text-muted-foreground/70">
              <ArrowDown />
            </div>
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <div className="mr-2 h-3.5 w-3.5 text-muted-foreground/70">
              <EyeOff />
            </div>
            Ocultar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
