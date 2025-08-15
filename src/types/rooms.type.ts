export type IRoomEvent = {
  title: string
  creator: string
  start: string
  end: string
  created_at: string
  updated_at: string
}

export type IRoomCard = {
  id: string
  name: string
  company: string
  calendar_id: string
  status: string
  next_event?: IRoomEvent
}

export type IRoom = {
  id: string
  name: string
  company: string
  calendar_id: string
  events: IRoomEvent[]
}

export type IRoomListResponse = {
  available: number
  reserved: number
  occupied: number
  cards: IRoomCard[]
}

export type GetRoomsParams = {
  date?: string
  company?: string
}

export type GetRoomParams = {
  roomId: string
  date?: string
}

export type ReschedulePayload = {
  event_title: string
  event_creator: string
  event_date: string
  text: string
}
