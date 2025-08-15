import { BaseSyntheticEvent } from 'react'

import { DialogContentProps } from '@radix-ui/react-dialog'
import { twMerge } from 'tailwind-merge'

import { Button } from '@/components/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ShadcnDialog,
} from '@/components/ui/dialog'

interface Props extends DialogContentProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  onSubmit?: (event: BaseSyntheticEvent) => void
  title: string
  description?: string
  isLoading?: boolean
}

const Dialog = ({
  isOpen,
  onClose,
  children,
  onSubmit,
  title,
  description,
  className,
  isLoading = false,
}: Props) => {
  const handleConfirmClick = (e: BaseSyntheticEvent) => {
    if (onSubmit) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  return (
    <ShadcnDialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={twMerge('flex max-h-screen max-w-4xl flex-col', className)}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div
          className="flex-1 overflow-y-auto py-4"
          data-testid="dialog-content"
        >
          <div className="flex w-full flex-col gap-2 pr-2">{children}</div>
        </div>
        {onSubmit && (
          <DialogFooter className="flex-shrink-0">
            <Button variant="destructive" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant={'secondary'}
              isLoading={isLoading}
              disabled={isLoading}
              onClick={handleConfirmClick}
              data-testid="confirm-button-dialog"
            >
              Confirmar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </ShadcnDialog>
  )
}

export { Dialog }
