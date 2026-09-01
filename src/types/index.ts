import type { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
  avatarEmoji: string | null
  createdAt: Timestamp | null
  lastSeen: Timestamp | null
}

export type RoomType = 'main' | 'dm' | 'group'

export interface Room {
  id: string
  type: RoomType
  name: string | null
  memberIds: string[]
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  createdBy: string | null
  lastMessage: {
    text: string
    senderId: string
    createdAt: Timestamp | null
  } | null
  // Per-member last-read marker, stored on the room doc itself (not a
  // subcollection) so unread badges and read receipts ride the same
  // room-list listener the sidebar already keeps open — no extra
  // per-room listeners needed just to know what's unread.
  lastRead?: Record<string, Timestamp>
}

export interface Attachment {
  url: string
  path: string
  contentType: string
  name: string
  width?: number
  height?: number
}

export interface Message {
  id: string
  text: string
  senderId: string
  createdAt: Timestamp | null
  editedAt: Timestamp | null
  deletedAt: Timestamp | null
  attachments: Attachment[]
  reactions: Record<string, string[]>
}

export interface TypingState {
  uid: string
  typing: boolean
  updatedAt: Timestamp | null
}

export const MAIN_ROOM_ID = 'the-hearth'

export const PRESENCE_STALE_MS = 100_000
export const TYPING_STALE_MS = 6_000
