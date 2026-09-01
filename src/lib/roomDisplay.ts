import type { Room, UserProfile } from '../types'

export function otherMemberIds(room: Room, currentUid: string): string[] {
  return room.memberIds.filter((id) => id !== currentUid)
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function roomDisplayName(room: Room, profiles: Record<string, UserProfile>, currentUid: string): string {
  if (room.type === 'main') return room.name || 'The Hearth'
  if (room.type === 'group' && room.name) return room.name

  const others = otherMemberIds(room, currentUid).map((id) => profiles[id]?.displayName || 'Friend')
  if (others.length === 0) return 'You'
  if (others.length <= 2) return others.join(', ')
  return `${others.slice(0, 2).join(', ')} +${others.length - 2}`
}

export function isRoomUnread(room: Room, currentUid: string): boolean {
  const lastMessage = room.lastMessage
  if (!lastMessage || lastMessage.senderId === currentUid) return false
  const lastMessageAt = lastMessage.createdAt?.toMillis() ?? 0
  const lastReadAt = room.lastRead?.[currentUid]?.toMillis() ?? 0
  return lastMessageAt > lastReadAt
}

export function roomAvatarLabel(room: Room, profiles: Record<string, UserProfile>, currentUid: string): string {
  const others = otherMemberIds(room, currentUid)
  if (others.length === 0) return '?'
  const firstName = profiles[others[0]]?.displayName || 'Friend'
  if (room.type === 'group' && others.length > 1) return `${firstName[0].toUpperCase()}+${others.length - 1}`
  return initials(firstName)
}
