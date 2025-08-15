import React, { forwardRef } from 'react'

import { twMerge } from 'tailwind-merge'

import { Spinner } from '@/components/spinner'
import { ShadcnButton } from '@/components/ui/button'
import {
  ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { icons, IIcons } from '@/utils/icons'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  isLoading?: boolean
  icon?: IIcons
  tooltipContent?: string
  className?: string
  children: React.ReactNode
}

const ButtonContent = ({
  isLoading,
  icon,
  children,
}: Pick<ButtonProps, 'isLoading' | 'icon' | 'children'>) => {
  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center gap-3">
        <Spinner />
        Carregando...
      </div>
    )
  }

  return (
    <div
      data-testid="button-children"
      className="flex w-full items-center justify-center gap-1"
    >
      {icon && React.createElement(icons[icon])}
      {children}
    </div>
  )
}

const ButtonWithTooltip = ({
  tooltipContent,
  children,
}: Pick<ButtonProps, 'tooltipContent' | 'children'>) => (
  <TooltipProvider>
    <ShadcnTooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="bg-zinc-600 text-zinc-50">
        {tooltipContent}
      </TooltipContent>
    </ShadcnTooltip>
  </TooltipProvider>
)

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'default',
      isLoading = false,
      icon,
      tooltipContent,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const buttonContent = (
      <ShadcnButton
        variant={variant}
        size={size}
        className={twMerge(
          'flex items-center justify-center gap-3 border-none transition duration-200',
          className,
        )}
        ref={ref}
        disabled={isLoading}
        {...rest}
      >
        <ButtonContent isLoading={isLoading} icon={icon}>
          {children}
        </ButtonContent>
      </ShadcnButton>
    )

    return tooltipContent ? (
      <ButtonWithTooltip tooltipContent={tooltipContent}>
        {buttonContent}
      </ButtonWithTooltip>
    ) : (
      buttonContent
    )
  },
)

Button.displayName = 'Button'

export { Button }
