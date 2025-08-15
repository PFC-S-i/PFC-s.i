'use client'
import {
  QueryCache,
  QueryClient,
  MutationCache,
  QueryKey,
  matchQuery,
} from '@tanstack/react-query'

import { useHandleError } from '@/hooks'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidates?: Array<QueryKey>
    }
  }
}

const useQueryClient = () => {
  const { handleError } = useHandleError()
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error: unknown) => {
        handleError(error, 'Erro ao carregar dados')
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        if (mutation.meta?.invalidates) {
          mutation.meta.invalidates.forEach((queryKey) => {
            queryClient.refetchQueries({ queryKey })
            queryClient.invalidateQueries({ queryKey })
          })
        }
        queryClient.invalidateQueries({
          predicate: (query) =>
            mutation.meta?.invalidates?.some((queryKey: QueryKey) =>
              matchQuery({ queryKey }, query),
            ) ?? true,
        })
      },
    }),
  })

  return queryClient
}
export { useQueryClient }
