import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from '../icons/Icons'
import { inviteFriend } from '../../lib/invites'

interface InviteModalProps {
  open: boolean
  onClose: () => void
  currentUid: string
}

export function InviteModal({ open, onClose, currentUid }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  function reset() {
    setEmail('')
    setStatus('idle')
    setError(null)
    setSentTo(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setError(null)
    try {
      await inviteFriend(email, currentUid)
      setSentTo(email.trim().toLowerCase())
      setEmail('')
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            onClose()
            reset()
          }}
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
              <div className="font-display text-[15px] font-semibold text-ink-1">Invite a friend</div>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  reset()
                }}
                className="text-ink-2 hover:text-ink-1"
              >
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="text-[13px] leading-relaxed text-ink-3">
              They'll be able to sign in with Google or an email link once added, and land straight in The Hearth.
            </div>

            {sentTo && (
              <div className="rounded-xl border border-accent-soft-border bg-accent-soft px-3.5 py-2.5 text-[13px] text-ink-1">
                Invited <span className="font-semibold">{sentTo}</span>.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <input
                type="email"
                required
                placeholder="friend@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-app px-3.5 py-2.5 text-sm text-ink-1 outline-none placeholder:text-ink-3 focus:border-accent"
              />
              {error && <div className="text-[12.5px] font-medium text-danger">{error}</div>}
              <button
                type="submit"
                disabled={status === 'sending' || !email.trim()}
                className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-opacity disabled:opacity-40"
              >
                {status === 'sending' ? 'Inviting…' : 'Send invite'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
