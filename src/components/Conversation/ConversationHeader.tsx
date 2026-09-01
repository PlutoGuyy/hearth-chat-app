import { FlameIcon } from '../icons/Icons'
import { otherMemberIds, roomAvatarLabel, roomDisplayName } from '../../lib/roomDisplay'
import { isOnline } from '../../lib/presence'
import { Avatar } from '../shared/Avatar'
import { MAIN_ROOM_ID } from '../../types'
import type { Room, UserProfile } from '../../types'

interface ConversationHeaderProps {
  room: Room
  profiles: Record<string, UserProfile>
  currentUid: string
  leading?: React.ReactNode
}

export function ConversationHeader({ room, profiles, currentUid, leading }: ConversationHeaderProps) {
  const isMain = room.id === MAIN_ROOM_ID
  const others = otherMemberIds(room, currentUid)
  const name = roomDisplayName(room, profiles, currentUid)

  let subtitle = ''
  if (isMain) {
    const onlineCount = room.memberIds.filter((id) => isOnline(profiles[id]?.lastSeen ?? null)).length
    subtitle = `${room.memberIds.length} friends · ${onlineCount} online`
  } else if (others.length === 1) {
    subtitle = isOnline(profiles[others[0]]?.lastSeen ?? null) ? 'Active now' : 'Offline'
  } else {
    subtitle = `${room.memberIds.length} people`
  }

  return (
    <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-3">
        {leading}
        {isMain ? (
          <>
            <FlameIcon className="h-[19px] w-[19px] text-accent" />
            <div className="font-display text-[15.5px] font-semibold text-ink-1">{name}</div>
            <div className="ml-1.5 flex">
              {room.memberIds.slice(0, 3).map((id, i) => (
                <div key={id} style={{ marginLeft: i === 0 ? 0 : -7 }} className="rounded-full border-2 border-app">
                  <Avatar profile={profiles[id]} fallbackLabel="?" size={24} />
                </div>
              ))}
              {room.memberIds.length > 3 && (
                <div
                  style={{ marginLeft: -7 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-app bg-surface text-[9px] font-semibold text-ink-3"
                >
                  +{room.memberIds.length - 3}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Avatar
              profile={others.length === 1 ? profiles[others[0]] : null}
              fallbackLabel={roomAvatarLabel(room, profiles, currentUid)}
              size={34}
            />
            <div>
              <div className="font-display text-[15.5px] font-semibold text-ink-1">{name}</div>
              <div className="text-[11.5px] text-ink-3">{subtitle}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
