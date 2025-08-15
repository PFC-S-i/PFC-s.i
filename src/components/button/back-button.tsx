import { useRouter } from 'next/navigation'

import { Button } from '@/components/button'
import { icons } from '@/utils'

const BackButton = () => {
  const router = useRouter()

  return (
    <Button size="icon" tooltipContent="Voltar" onClick={() => router.back()}>
      <icons.arrowLeft />
    </Button>
  )
}

export { BackButton }
