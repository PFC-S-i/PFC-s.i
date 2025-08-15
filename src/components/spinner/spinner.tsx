import { twMerge } from 'tailwind-merge'

interface Props {
  className?: string
}

const Spinner = ({ className }: Props) => {
  return (
    <div
      className={twMerge(
        'inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-[--primary] motion-reduce:animate-[spin_1.5s_linear_infinite]',
        className,
      )}
      role="status"
      data-testid="spinner"
    />
  )
}

export { Spinner }
