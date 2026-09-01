import { useState } from 'react'
import { motion } from 'framer-motion'
import { FlameIcon, GoogleLogo } from '../icons/Icons'

interface LoginScreenProps {
  onGoogle: () => void
  onEmailLink: (email: string) => void
  error: string | null
  emailLinkSent: boolean
}

export function LoginScreen({ onGoogle, onEmailLink, error, emailLinkSent }: LoginScreenProps) {
  const [email, setEmail] = useState('')

  return (
    <div className="relative flex h-full min-h-screen w-full items-center justify-center overflow-hidden bg-app-light">
      <motion.div
        className="pointer-events-none absolute -top-32 -right-24 h-[480px] w-[480px] rounded-full bg-accent-soft-light opacity-55 blur-[70px]"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-40 -left-36 h-[420px] w-[420px] rounded-full bg-accent-soft-light opacity-40 blur-[80px]"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative flex w-[432px] max-w-[90vw] flex-col items-center gap-7 rounded-[28px] border border-border-light bg-card-light p-11 shadow-[0_24px_60px_-20px_rgba(80,50,30,0.18)]"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft-light text-accent-light">
            <FlameIcon className="h-[26px] w-[26px]" />
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="font-display text-2xl font-bold tracking-tight text-ink-1-light">Hearth</div>
            <div className="text-sm leading-snug text-ink-2-light">A place for the people who matter.</div>
          </div>
        </div>

        {emailLinkSent ? (
          <div className="w-full rounded-2xl border border-border-light bg-app-light px-4 py-3.5 text-center text-sm text-ink-1-light">
            Check <span className="font-semibold">{email}</span> for a sign-in link.
          </div>
        ) : (
          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={onGoogle}
              className="flex w-full items-center gap-2.5 rounded-2xl border border-border-light bg-card-light px-[18px] py-3.5 transition-colors hover:bg-app-light"
            >
              <GoogleLogo className="h-[18px] w-[18px]" />
              <span className="flex-1 text-center text-sm font-semibold text-ink-1-light">Continue with Google</span>
            </button>

            <div className="my-0.5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border-light" />
              <span className="text-xs text-ink-3-light">or</span>
              <div className="h-px flex-1 bg-border-light" />
            </div>

            <form
              className="flex flex-col gap-2.5"
              onSubmit={(e) => {
                e.preventDefault()
                if (email.trim()) onEmailLink(email.trim())
              }}
            >
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-border-light bg-app-light px-4 py-3.5 font-body text-sm text-ink-1-light outline-none placeholder:text-ink-3-light focus:border-accent-light"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-accent-light px-[18px] py-3.5 text-sm font-semibold text-card-light transition-opacity hover:opacity-90"
              >
                Send me a link
              </button>
            </form>
          </div>
        )}

        {error && <div className="w-full text-center text-xs font-medium text-danger">{error}</div>}

        <div className="text-center text-xs leading-relaxed text-ink-3-light">
          Friends only — you'll need an invite to join.
        </div>
      </motion.div>
    </div>
  )
}
