import { Progress as ShadcnProgress } from '@/components/ui/progress'

interface Props {
  progress: number
}

const Progress = ({ progress }: Props) => {
  return (
    <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
      <ShadcnProgress
        value={progress}
        className="h-full rounded-full bg-primary"
      />
    </div>
  )
}

export { Progress }
