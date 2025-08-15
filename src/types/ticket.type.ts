import { ICategory } from './category.type'

export type ITicket = {
  id: string
  code: string
  category: ICategory
  user_name: string
  user_email: string
  user_company: string
  user_extension: string

  user_department: {
    id: string
    name: string
  }

  operator: {
    id: string
    name: string
    email: string
  } | null

  extension: string
  description: string
  status: string
  internal_status?: string | null
  user_rating?: number | null
  user_comment?: string | null
  custom_field_1?: string | null
  custom_field_2?: string | null
  custom_field_3?: string | null
  priority: string
  operator_notes: string

  custom_field?: {
    id: string
    value: string
  }

  attachment?: string | null
  created_at: string
}
