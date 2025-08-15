export type IMessage = {
  id: string
  content: string
  created_at: string
  sender: {
    id: string
    name: string
    email: string
    company: string
  }
}
