'use client'

import { useEffect, useState } from 'react'

import { useSession } from 'next-auth/react'

import { icons } from '@/utils'
import { baseRoutes } from '@/utils/base-routes'

export type ISidebarOption = {
  label: string
  icon: React.ElementType
  link: string
}

export const useSidebarOptions = () => {
  const { data: session } = useSession()

  const [sidebarOptions, setSidebarOptions] = useState<ISidebarOption[]>([
    {
      label: 'Início',
      icon: icons.home,
      link: baseRoutes.home,
    },
    {
      label: 'Central de Ajuda',
      icon: icons.circleHelp,
      link: 'https://tickets-brown-pi.vercel.app/',
    },
  ])

  useEffect(() => {
    if (session?.user) {
      const newOptions: ISidebarOption[] = []

      setSidebarOptions((prevOptions) => {
        return addNewOptions(prevOptions, newOptions)
      })
    }
  }, [session?.user])

  const addNewOptions = (
    prevOptions: ISidebarOption[],
    newOptions: ISidebarOption[],
  ) => {
    const updatedOptions = [...prevOptions]
    newOptions.forEach((newOption) => {
      if (!updatedOptions.some((option) => option.link === newOption.link)) {
        updatedOptions.push(newOption)
      }
    })
    return updatedOptions
  }

  return sidebarOptions
}
