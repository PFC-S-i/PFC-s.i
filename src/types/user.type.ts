import { ICard, IDepartment, IGroup } from '@/types'

export type IUser = {
  id: string
  email: string
  name: string
  company: string
  department: IDepartment
  theme: 'light' | 'dark'
  color: string
  picture: string
  cards: ICard[]
  groups: IGroup[]
  image?: string
  picture_url?: string
}

export interface IUserLogin {
  exp: number
  iat: number
  id: string
  name: string
  token: string
  tempToken: string
  email: string
}
