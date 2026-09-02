import { useMemo, useState } from 'react'
import { Sidebar } from '../Sidebar/Sidebar'
import { ConversationView } from '../Conversation/ConversationView'
import { BackIcon, FlameIcon } from '../icons/Icons'
import { useRooms } from '../../hooks/useRooms'
import { findOrCreateDirectRoom, createGroupRoom } from '../../lib/rooms'
import { isRoomUnread } from '../../lib/roomDisplay'
import { MAIN_ROOM_ID } from '../../types'
import type { UserProfile } from '../../types'

interface AppShellProps {
  uid: string
  profile: UserProfile | null
  onSignOut: () => void
}

export function AppShell({ uid, profile, onSignOut }: AppShellProps) {
  const { rooms, profiles } = useRooms(uid)
  const unread = useMemo(() => {
    const map: Record<string, boolean> = {}
    rooms.forEach((room) => {
      map[room.id] = isRoomUnread(room, uid)
    })
    return map
  }, [rooms, uid])
  const [activeRoomId, setActiveRoomId] = useState<string>(MAIN_ROOM_ID)
  const [showListOnMobile, setShowListOnMobile] = useState(true)

  const activeRoom = rooms.find((r) => r.id === activeRoomId)

  function selectRoom(roomId: string) {
    setActiveRoomId(roomId)
    setShowListOnMobile(false)
  }

  async function handleCreateDM(otherUid: string) {
    const roomId = await findOrCreateDirectRoom(uid, otherUid)
    selectRoom(roomId)
  }

  async function handleCreateGroup(memberUids: string[], name: string) {
    const roomId = await createGroupRoom(uid, memberUids, name)
    selectRoom(roomId)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-app">
      <div className="flex min-h-0 flex-1">
        <div className={`${showListOnMobile ? 'flex' : 'hidden'} w-full md:flex md:w-auto`}>
          <Sidebar
            rooms={rooms}
            profiles={profiles}
            currentUid={uid}
            currentProfile={profile}
            activeRoomId={activeRoomId}
            unread={unread}
            onSelectRoom={selectRoom}
            onCreateDM={handleCreateDM}
            onCreateGroup={handleCreateGroup}
            onSignOut={onSignOut}
          />
        </div>

        <div className={`${showListOnMobile ? 'hidden' : 'flex'} min-w-0 flex-1 md:flex`}>
          {activeRoom ? (
            <ConversationView
              key={activeRoom.id}
              room={activeRoom}
              profiles={profiles}
              currentUid={uid}
              leading={
                <button
                  type="button"
                  onClick={() => setShowListOnMobile(true)}
                  className="-ml-2 flex h-11 w-11 flex-shrink-0 items-center justify-center text-ink-1 md:hidden"
                >
                  <BackIcon className="h-[21px] w-[21px]" />
                </button>
              }
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-ink-3">
              <FlameIcon className="h-8 w-8 text-accent opacity-40" />
              <div className="text-sm">Loading The Hearth…</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
