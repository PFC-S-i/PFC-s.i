import { Dialog } from '@/components'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  isLoading?: boolean
}

const DialogConfirmCancel = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: Props) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Cancelar Requisição"
      isLoading={isLoading}
    >
      <p>Tem certeza que deseja cancelar a requisição?</p>
    </Dialog>
  )
}

export { DialogConfirmCancel }
