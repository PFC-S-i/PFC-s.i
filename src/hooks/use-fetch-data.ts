import { useQuery, UseQueryOptions } from '@tanstack/react-query'

export const useFetchData = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryFn' | 'queryKey'>,
) => {
  return useQuery<T>({
    queryKey,
    queryFn,
    refetchOnWindowFocus: false,
    retry: false,
    ...options,
  })
}
