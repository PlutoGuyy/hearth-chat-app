import { useState } from 'react'
import { motion } from 'framer-motion'
import { messageTime } from '../../lib/time'
import { CheckDoubleIcon } from '../icons/Icons'
import { Avatar } from '../shared/Avatar'
import type { Message, UserProfile } from '../../types'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮']

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showMeta: boolean
  senderProfile?: UserProfile
  isLastInGroup: boolean
  readLabel?: string | null
  currentUid: string
  onToggleReaction: (emoji: string) => void
  onEdit: (text: string) => void
  onDelete: () => void
}

export function MessageBubble({
  message,
  isOwn,
  showMeta,
  senderProfile,
  isLastInGroup,
  readLabel,
  currentUid,
  onToggleReaction,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [hovered, setHovered] = useState(false)
  const [picker, setPicker] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.text)

  const isDeleted = !!message.deletedAt
  const reactionEntries = Object.entries(message.reactions || {}).filter(([, uids]) => uids.length > 0)

  const bubbleRadius = isOwn
    ? isLastInGroup
      ? 'rounded-tl-2xl rounded-tr-[4px] rounded-b-2xl'
      : 'rounded-2xl'
    : isLastInGroup
      ? 'rounded-tr-2xl rounded-tl-[4px] rounded-b-2xl'
      : 'rounded-2xl'

  function submitEdit() {
    if (draft.trim() && draft.trim() !== message.text) onEdit(draft.trim())
    setEditing(false)
  }

  return (
    <div
      className={`flex max-w-[440px] flex-col gap-1 ${isOwn ? 'items-end self-end' : 'items-start'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setPicker(false)
      }}
    >
      {showMeta && senderProfile && (
        <div className="mb-0.5 flex items-center gap-2">
          <Avatar profile={senderProfile} size={26} />
          <div className="text-[12.5px] font-semibold text-ink-2">{senderProfile.displayName}</div>
        </div>
      )}

      <div className={`group relative flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''} ${!isOwn && !showMeta ? 'ml-[34px]' : ''}`}>
        {isDeleted ? (
          <div className={`w-fit px-3.5 py-2.5 text-[13.5px] italic text-ink-3 ${bubbleRadius} border border-border/60`}>
            Message deleted
          </div>
        ) : editing ? (
          <div className="flex w-full flex-col gap-1.5">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submitEdit()
                }
                if (e.key === 'Escape') setEditing(false)
              }}
              className="w-[280px] resize-none rounded-2xl bg-surface px-3.5 py-2.5 text-[14px] text-ink-1 outline-none"
              rows={2}
            />
            <div className="flex gap-2 text-xs">
              <button onClick={submitEdit} className="font-semibold text-accent">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="text-ink-3">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            layout
            className={`w-fit px-3.5 py-2.5 text-[14px] leading-[1.45] ${bubbleRadius} ${
              isOwn ? 'bg-accent text-on-accent' : 'bg-surface text-ink-1'
            }`}
          >
            {message.attachments?.map((att) => (
              <img
                key={att.path}
                src={att.url}
                alt={att.name}
                className="mb-1.5 max-w-[220px] cursor-pointer rounded-[14px]"
                onClick={() => window.open(att.url, '_blank')}
              />
            ))}
            {message.text && <div className="whitespace-pre-wrap">{message.text}</div>}
            {message.editedAt && <div className={`mt-0.5 text-[10.5px] ${isOwn ? 'text-on-accent/70' : 'text-ink-3'}`}>edited</div>}
          </motion.div>
        )}

        {!isDeleted && !editing && hovered && (
          <div className="flex items-center gap-1 rounded-full bg-surface px-1.5 py-1 shadow-sm">
            <button
              type="button"
              onClick={() => setPicker((v) => !v)}
              className="rounded-full px-1.5 text-sm hover:bg-surface-hover"
            >
              🙂
            </button>
            {isOwn && (
              <>
                <button type="button" onClick={() => setEditing(true)} className="px-1 text-[11px] text-ink-2 hover:text-ink-1">
                  Edit
                </button>
                <button type="button" onClick={onDelete} className="px-1 text-[11px] text-danger hover:opacity-80">
                  Delete
                </button>
              </>
            )}
          </div>
        )}

        {picker && (
          <div className="absolute -top-10 flex gap-1 rounded-full border border-border bg-surface px-2 py-1 shadow-lg">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onToggleReaction(emoji)
                  setPicker(false)
                }}
                className="rounded-full px-1 text-base hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {reactionEntries.length > 0 && (
        <div className={`flex flex-wrap gap-1 ${isOwn ? 'justify-end' : ''} ${!isOwn && !showMeta ? 'ml-[34px]' : ''}`}>
          {reactionEntries.map(([emoji, uids]) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onToggleReaction(emoji)}
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] transition-colors ${
                uids.includes(currentUid) ? 'border-accent-soft-border bg-accent-soft text-ink-1' : 'border-border bg-surface text-ink-2'
              }`}
            >
              <span>{emoji}</span>
              <span>{uids.length}</span>
            </button>
          ))}
        </div>
      )}

      {isLastInGroup && !isDeleted && (
        <div className={`flex items-center gap-1 text-[11px] text-ink-3 ${!isOwn && !showMeta ? 'ml-[34px]' : ''}`}>
          <span>{readLabel ?? messageTime(message.createdAt)}</span>
          {readLabel && <CheckDoubleIcon className="h-[13px] w-[13px] text-accent" />}
        </div>
      )}
    </div>
  )
}
