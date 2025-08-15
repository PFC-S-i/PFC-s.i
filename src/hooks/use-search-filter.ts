'use client'

import { useMemo } from 'react'

import { usePathname } from 'next/navigation'

import { useHandleError, useInfiniteQueryHook } from '@/hooks'
import { ApiResponse } from '@/types'

interface SearchResponse<T> extends ApiResponse<T> {
  page: number
}

function useSearchFilter<T>() {
  const params = usePathname()
  const { handleError } = useHandleError()

  const searchQueries = async (
    page: number,
    limit: number,
    search: Record<string, string>,
    filter?: (
      page: number,
      limit: number,
      search: Record<string, string>,
      param?: keyof T,
      status?: string | boolean,
    ) => Promise<ApiResponse<T>>,
    param?: keyof T,
  ): Promise<SearchResponse<T>> => {
    try {
      if (!search || !filter) {
        return { items: [], count: 0, page: 0 }
      }
      if (page < 0 || limit <= 0) {
        throw new Error('Valores de página ou limite inválidos.')
      }
      const data = await filter(page, limit, search, param)
      return {
        items: data.items || [],
        count: data.count || 0,
        page,
      }
    } catch (error) {
      handleError(error)
      return { items: [], count: 0, page: 0 }
    }
  }

  const useSearchQuery = (
    search: Record<string, string>,
    filter?: (
      page: number,
      limit: number,
      search: Record<string, string>,
      param?: keyof T,
      status?: string | boolean,
    ) => Promise<ApiResponse<T>>,
    param?: keyof T,
  ) => {
    const queryKey = useMemo(() => ['search', params, search], [search])

    return useInfiniteQueryHook<T>(
      queryKey,
      async (page, limit) =>
        await searchQueries(page, limit, search, filter, param),
      !!search,
    )
  }

  return { useSearchQuery }
}

export { useSearchFilter }
