'use client'
import { useCallback } from 'react'

import { signIn } from 'next-auth/react'

import { useHandleError } from '@/hooks'

export function useSignIn() {
  const { handleError } = useHandleError()

  const signInAsync = useCallback(async () => {
    try {
      await signIn('credentials', { redirect: false })
    } catch (err) {
      handleError(err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { signInAsync }
}
