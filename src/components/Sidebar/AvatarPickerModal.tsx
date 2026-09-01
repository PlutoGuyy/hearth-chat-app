import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from '../icons/Icons'
import { Avatar } from '../shared/Avatar'
import { setAvatarEmoji } from '../../lib/profile'
import type { UserProfile } from '../../types'

const EMOJI_OPTIONS = [
  '😀', '😎', '🥲', '🥸', '🤠', '🥳', '😴', '🤔',
  '👻', '👽', '🤖', '💀', '🐶', '🐱', '🦊', '🐼',
  '🐨', '🦁', '🐸', '🐙', '🦖', '🐢', '🦄', '🐝',
  '🔥', '⚡', '🌊', '🌙', '⭐', '🌵', '🍕', '🍩',
  '🎮', '🎧', '🎸', '⚽', '🏀', '🚀', '🎯', '🧊',
]

interface AvatarPickerModalProps {
  open: boolean
  onClose: () => void
  profile: UserProfile | null
  uid: string
}

export function AvatarPickerModal({ open, onClose, profile, uid }: AvatarPickerModalProps) {
  async function pick(emoji: string | null) {
    await setAvatarEmoji(uid, emoji)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-[360px] max-w-[90vw] flex-col gap-4 rounded-2xl border border-border bg-sidebar p-5"
          >
            <div className="flex items-center justify-between">
              <div className="font-display text-[15px] font-semibold text-ink-1">Choose an avatar</div>
              <button type="button" onClick={onClose} className="text-ink-2 hover:text-ink-1">
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="grid grid-cols-8 gap-1.5">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => pick(emoji)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors hover:bg-surface-hover ${
                    profile?.avatarEmoji === emoji ? 'bg-accent-soft ring-1 ring-accent-soft-border' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {profile?.avatarEmoji && (
              <button
                type="button"
                onClick={() => pick(null)}
                className="flex items-center gap-2.5 rounded-xl border border-border px-3.5 py-2.5 text-left text-[13px] text-ink-2 transition-colors hover:bg-surface"
              >
                <Avatar profile={profile ? { ...profile, avatarEmoji: null } : null} size={24} />
                Use my photo instead
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
