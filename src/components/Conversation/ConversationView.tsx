import { ConversationHeader } from './ConversationHeader'
import { MessageList } from './MessageList'
import { Composer } from './Composer'
import { useMessages } from '../../hooks/useMessages'
import { roomDisplayName } from '../../lib/roomDisplay'
import { MAIN_ROOM_ID } from '../../types'
import type { Room, UserProfile } from '../../types'

interface ConversationViewProps {
  room: Room
  profiles: Record<string, UserProfile>
  currentUid: string
  leading?: React.ReactNode
}

export function ConversationView({ room, profiles, currentUid, leading }: ConversationViewProps) {
  const { messages, typingUids } = useMessages(room.id, currentUid)
  const isMain = room.id === MAIN_ROOM_ID
  const name = roomDisplayName(room, profiles, currentUid)

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <ConversationHeader room={room} profiles={profiles} currentUid={currentUid} leading={leading} />
      <MessageList
        room={room}
        messages={messages}
        loading={false}
        currentUid={currentUid}
        profiles={profiles}
        typingUids={typingUids}
        reads={room.lastRead ?? {}}
        emptyTitle={isMain ? 'Light The Hearth' : `Say hi to ${name}`}
        emptySubtitle={isMain ? 'Be the first to say something.' : 'This is the beginning of your conversation.'}
      />
      <Composer roomId={room.id} uid={currentUid} placeholder={isMain ? 'Message The Hearth' : `Message ${name}`} />
    </div>
  )
}
