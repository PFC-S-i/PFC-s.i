'use client'

import {
  FetchNextPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
  QueryKey,
  QueryObserverResult,
  RefetchOptions,
  useInfiniteQuery,
} from '@tanstack/react-query'

import { useHandleError } from '@/hooks'
import { ApiResponse } from '@/types/api-response.type'

export interface IInfiniteQueryResult<T> {
  data: T[]
  isLoading?: boolean
  hasNextPage?: boolean
  fetchNextPage?: (
    options?: FetchNextPageOptions,
  ) => Promise<InfiniteQueryObserverResult<InfiniteData<ApiResponse<T>>, Error>>
  isFetchingNextPage?: boolean
  refetch?: (
    options?: RefetchOptions,
  ) => Promise<
    QueryObserverResult<InfiniteData<ApiResponse<T>, unknown>, Error>
  >
}
const PAGE_SIZE = 10
export const useInfiniteQueryHook = <T>(
  queryKey: QueryKey,
  queryFn: (
    page: number,
    limit: number,
    filters?: Record<string, string>,
  ) => Promise<ApiResponse<T>>,
  enabled?: boolean,
  pageSize?: number,
  filters?: Record<string, string>,
): IInfiniteQueryResult<T> => {
  const { handleError } = useHandleError()
  const queryResult = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const result = await queryFn(pageParam, pageSize ?? PAGE_SIZE, filters)
        return {
          ...result,
          results: result.items ?? [],
          count: result.count ?? 0,
        }
      } catch (err) {
        handleError(err)
        throw err
      }
    },
    getNextPageParam: (
      lastPage: ApiResponse<T>,
      allPages: ApiResponse<T>[],
    ) => {
      const totalItemsLoaded = allPages.reduce(
        (acc, page) => acc + (page.items?.length || 0),
        0,
      )
      const hasMoreItems = totalItemsLoaded < lastPage.count

      return hasMoreItems ? allPages.length : undefined
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    enabled: enabled ?? true,
    retry: false,
  })

  const data = queryResult.data?.pages.flatMap((page) => page.results) ?? []

  return {
    ...queryResult,
    data,
    isLoading: queryResult.isLoading,
    hasNextPage: queryResult.hasNextPage,
    fetchNextPage: queryResult.fetchNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    refetch: queryResult.refetch,
  }
}
