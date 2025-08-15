import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

export const defaultStaleTime = 0

export enum Queries {
  user = 'user',
  products = 'products',
  addProduct = 'addProduct',
  compositions = 'compositions',
  alterations = 'alterations',
}
export type QueryKey = keyof typeof Queries
