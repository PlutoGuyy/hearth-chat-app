import { motion } from 'framer-motion'
import { otherMemberIds, roomAvatarLabel, roomDisplayName } from '../../lib/roomDisplay'
import { isOnline } from '../../lib/presence'
import { shortRelative } from '../../lib/time'
import { Avatar } from '../shared/Avatar'
import type { Room, UserProfile } from '../../types'

interface DMListItemProps {
  room: Room
  profiles: Record<string, UserProfile>
  currentUid: string
  active: boolean
  unread: boolean
  onClick: () => void
}

export function DMListItem({ room, profiles, currentUid, active, unread, onClick }: DMListItemProps) {
  const name = roomDisplayName(room, profiles, currentUid)
  const avatarLabel = roomAvatarLabel(room, profiles, currentUid)
  const others = otherMemberIds(room, currentUid)
  const showPresence = room.type === 'dm' && others.length === 1 && isOnline(profiles[others[0]]?.lastSeen ?? null)

  const lastMessage = room.lastMessage
  const preview = lastMessage
    ? `${lastMessage.senderId === currentUid ? 'You: ' : ''}${lastMessage.text || 'Sent a photo'}`
    : 'No messages yet'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={`flex w-full items-center gap-[11px] rounded-xl px-2.5 py-2.5 text-left transition-colors ${
        active ? 'bg-surface' : 'hover:bg-surface/60'
      }`}
    >
      <div className="relative h-[38px] w-[38px] flex-shrink-0">
        <Avatar profile={others.length === 1 ? profiles[others[0]] : null} fallbackLabel={avatarLabel} size={38} />
        {showPresence && (
          <div className="absolute -right-px -bottom-px h-[11px] w-[11px] rounded-full border-2 border-sidebar bg-presence" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className={`truncate text-[13.5px] ${unread ? 'font-bold text-ink-1' : 'font-semibold text-ink-1'}`}>{name}</div>
          <div className="flex-shrink-0 text-[11px] text-ink-3">{shortRelative(lastMessage?.createdAt ?? null)}</div>
        </div>
        <div className={`truncate text-[12.5px] ${unread ? 'font-semibold text-ink-1' : 'text-ink-3'}`}>{preview}</div>
      </div>
      {unread && <div className="h-2 w-2 flex-shrink-0 rounded-full bg-accent" />}
    </motion.button>
  )
}
