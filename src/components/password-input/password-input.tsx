'use client'

import { useState, InputHTMLAttributes } from 'react'

import { Eye, EyeClosed } from 'lucide-react'

import { Input } from '../input'

type Props = InputHTMLAttributes<HTMLInputElement>

const PasswordInput = ({ className = '', ...props }: Props) => {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={show ? 'text' : 'password'}
        className={`w-full  rounded  p-2 pr-10 ${className}`}
        autoComplete="current-password"
        icon="key"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary"
      >
        {show ? <EyeClosed size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}

export { PasswordInput }
