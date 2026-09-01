import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from '../icons/Icons'
import { Avatar } from '../shared/Avatar'
import type { UserProfile } from '../../types'

interface NewDMModalProps {
  open: boolean
  onClose: () => void
  profiles: Record<string, UserProfile>
  currentUid: string
  onCreateDM: (otherUid: string) => void
  onCreateGroup: (memberUids: string[], name: string) => void
}

export function NewDMModal({ open, onClose, profiles, currentUid, onCreateDM, onCreateGroup }: NewDMModalProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')

  const friends = Object.values(profiles).filter((p) => p.uid !== currentUid)

  function toggle(uid: string) {
    setSelected((prev) => (prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]))
  }

  function handleStart() {
    if (selected.length === 0) return
    if (selected.length === 1) {
      onCreateDM(selected[0])
    } else {
      onCreateGroup(selected, groupName)
    }
    setSelected([])
    setGroupName('')
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
            className="flex w-[380px] max-w-[90vw] flex-col gap-4 rounded-2xl border border-border bg-sidebar p-5"
          >
            <div className="flex items-center justify-between">
              <div className="font-display text-[15px] font-semibold text-ink-1">New message</div>
              <button type="button" onClick={onClose} className="text-ink-2 hover:text-ink-1">
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {friends.length === 0 && (
                <div className="py-6 text-center text-sm text-ink-3">No friends have joined yet.</div>
              )}
              {friends.map((friend) => {
                const isChecked = selected.includes(friend.uid)
                return (
                  <button
                    key={friend.uid}
                    type="button"
                    onClick={() => toggle(friend.uid)}
                    className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                      isChecked ? 'bg-accent-soft' : 'hover:bg-surface'
                    }`}
                  >
                    <Avatar profile={friend} size={32} />
                    <div className="flex-1 truncate text-[13.5px] text-ink-1">{friend.displayName}</div>
                    <div
                      className={`h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 ${
                        isChecked ? 'border-accent bg-accent' : 'border-border'
                      }`}
                    />
                  </button>
                )
              })}
            </div>

            {selected.length > 1 && (
              <input
                type="text"
                placeholder="Group name (optional)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full rounded-xl border border-border bg-app px-3.5 py-2.5 text-sm text-ink-1 outline-none placeholder:text-ink-3 focus:border-accent"
              />
            )}

            <button
              type="button"
              disabled={selected.length === 0}
              onClick={handleStart}
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-opacity disabled:opacity-40"
            >
              {selected.length > 1 ? 'Create group' : 'Start conversation'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
