import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { EmptyState, MessageSkeleton } from './EmptyState'
import { dayLabel, messageTime } from '../../lib/time'
import { deleteMessage, editMessage, toggleReaction } from '../../lib/rooms'
import { MAIN_ROOM_ID } from '../../types'
import type { Timestamp } from 'firebase/firestore'
import type { Message, Room, UserProfile } from '../../types'

interface MessageListProps {
  room: Room
  messages: Message[]
  loading: boolean
  currentUid: string
  profiles: Record<string, UserProfile>
  typingUids: string[]
  reads: Record<string, Timestamp>
  emptyTitle: string
  emptySubtitle: string
}

export function MessageList({
  room,
  messages,
  loading,
  currentUid,
  profiles,
  typingUids,
  reads,
  emptyTitle,
  emptySubtitle,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isGroupLike = room.id === MAIN_ROOM_ID || room.type === 'group'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, typingUids.length])

  if (loading) {
    return (
      <div className="flex-1 overflow-hidden px-7 py-6">
        <MessageSkeleton />
      </div>
    )
  }

  if (messages.length === 0) {
    return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
  }

  const lastOwnMessage = [...messages].reverse().find((m) => m.senderId === currentUid && !m.deletedAt)
  const readByOther = Object.entries(reads).find(
    ([uid, lastReadAt]) => uid !== currentUid && lastOwnMessage?.createdAt && lastReadAt.toMillis() >= lastOwnMessage.createdAt.toMillis(),
  )

  return (
    <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-7 py-[22px]">
      <AnimatePresence initial={false}>
        {messages.map((message, i) => {
          const prev = messages[i - 1]
          const next = messages[i + 1]
          const sameDayAsPrev = prev?.createdAt && message.createdAt && prev.createdAt.toDate().toDateString() === message.createdAt.toDate().toDateString()
          const showDivider = !sameDayAsPrev

          const startsGroup = !prev || prev.senderId !== message.senderId || !sameDayAsPrev
          const endsGroup = !next || next.senderId !== message.senderId || (next.createdAt && message.createdAt && next.createdAt.toDate().toDateString() !== message.createdAt.toDate().toDateString())

          const isOwn = message.senderId === currentUid
          const sender = profiles[message.senderId]
          const showMeta = isGroupLike && !isOwn && startsGroup
          const isRead = endsGroup && isOwn && message === lastOwnMessage && !!readByOther

          return (
            <div key={message.id} className="flex flex-col gap-3.5">
              {showDivider && (
                <div className="self-center rounded-full bg-surface px-3.5 py-1 text-[11px] text-ink-3">
                  {dayLabel(message.createdAt)}
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  showMeta={showMeta}
                  senderProfile={sender}
                  isLastInGroup={!!endsGroup}
                  readLabel={isRead ? `Read ${messageTime(message.createdAt)}` : null}
                  currentUid={currentUid}
                  onToggleReaction={(emoji) => {
                    const reacted = message.reactions?.[emoji]?.includes(currentUid)
                    toggleReaction(room.id, message.id, currentUid, emoji, !reacted)
                  }}
                  onEdit={(text) => editMessage(room.id, message.id, text)}
                  onDelete={() => deleteMessage(room.id, message.id)}
                />
              </motion.div>
            </div>
          )
        })}
      </AnimatePresence>

      <AnimatePresence>{typingUids.length > 0 && <TypingIndicator key="typing" />}</AnimatePresence>

      <div ref={bottomRef} />
    </div>
  )
}
