import { useState } from 'react'
import { FlameIcon, PlusIcon } from '../icons/Icons'
import { HearthCard } from './HearthCard'
import { DMListItem } from './DMListItem'
import { UserFooter } from './UserFooter'
import { NewDMModal } from './NewDMModal'
import { isOnline } from '../../lib/presence'
import { MAIN_ROOM_ID } from '../../types'
import type { Room, UserProfile } from '../../types'

interface SidebarProps {
  rooms: Room[]
  profiles: Record<string, UserProfile>
  currentUid: string
  currentProfile: UserProfile | null
  activeRoomId: string | null
  unread: Record<string, boolean>
  onSelectRoom: (roomId: string) => void
  onCreateDM: (otherUid: string) => void
  onCreateGroup: (memberUids: string[], name: string) => void
  onSignOut: () => void
}

export function Sidebar({
  rooms,
  profiles,
  currentUid,
  currentProfile,
  activeRoomId,
  unread,
  onSelectRoom,
  onCreateDM,
  onCreateGroup,
  onSignOut,
}: SidebarProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const mainRoom = rooms.find((r) => r.id === MAIN_ROOM_ID)
  const dmRooms = rooms.filter((r) => r.id !== MAIN_ROOM_ID)
  const totalFriends = mainRoom?.memberIds.length ?? Object.keys(profiles).length
  const onlineCount = Object.values(profiles).filter((p) => isOnline(p.lastSeen)).length

  return (
    <div className="flex h-full w-[296px] flex-shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 px-[18px] pt-5 pb-3.5 font-display text-[17px] font-bold tracking-tight text-ink-1">
        <FlameIcon className="h-[17px] w-[17px] text-accent" />
        Hearth
      </div>

      <HearthCard
        active={activeRoomId === MAIN_ROOM_ID}
        onlineCount={onlineCount}
        totalCount={totalFriends}
        onClick={() => onSelectRoom(MAIN_ROOM_ID)}
      />

      <div className="flex items-center justify-between px-[18px] pt-1 pb-2">
        <div className="text-[11px] font-bold tracking-[0.06em] text-ink-3">DIRECT MESSAGES</div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-ink-2 transition-colors hover:text-accent"
        >
          <PlusIcon className="h-[17px] w-[17px]" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {dmRooms.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-6 text-center">
            <div className="text-[13px] font-medium text-ink-2">No direct messages yet</div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-1 text-[12.5px] font-semibold text-accent hover:underline"
            >
              Start one
            </button>
          </div>
        )}
        {dmRooms.map((room) => (
          <DMListItem
            key={room.id}
            room={room}
            profiles={profiles}
            currentUid={currentUid}
            active={activeRoomId === room.id}
            unread={!!unread[room.id]}
            onClick={() => onSelectRoom(room.id)}
          />
        ))}
      </div>

      <UserFooter profile={currentProfile} fallbackName="You" currentUid={currentUid} onSignOut={onSignOut} />

      <NewDMModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        profiles={profiles}
        currentUid={currentUid}
        onCreateDM={onCreateDM}
        onCreateGroup={onCreateGroup}
      />
    </div>
  )
}
