export type ICardItem = {
  id: string
  name: string
  link?: string
}

export type ICard = {
  card: ICardItem
  order: number
}
