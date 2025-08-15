import { useState } from 'react'

import { useToast } from '@/hooks/use-toast'

import { Button } from '../button'
import { Dialog } from '../dialog'

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  eventTitle: string
  eventCreator: string
  eventDate: string
  onSubmit: (text: string) => Promise<void>
}

export function RescheduleModal({
  isOpen,
  onClose,
  onSubmit,
}: RescheduleModalProps) {
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleSave() {
    if (!text.trim()) {
      setError('Por favor, escreva uma mensagem.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(text)
      setText('')
      toast({
        title: 'Solicitação enviada',
        description: 'Reagendamento solicitado por e-mail com sucesso.',
      })
      onClose()
    } catch (err) {
      let message = 'Erro ao enviar solicitação.'

      if (err instanceof Error) {
        message = err.message
      } else if (typeof err === 'string') {
        message = err
      }

      setError(message)
      toast({
        title: 'Erro ao enviar solicitação',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={'Solicitar troca'}
      className="border-none"
    >
      <div className="p-3">
        <textarea
          placeholder="Descreva o motivo da solicitação"
          className="mb-4 w-full resize-none rounded p-2 text-sm shadow-xl placeholder:text-gray-400"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button
            variant="destructive"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            isLoading={isSubmitting}
          >
            Enviar solicitação
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
