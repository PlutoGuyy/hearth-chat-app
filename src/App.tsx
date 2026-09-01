import { AnimatePresence, motion } from 'framer-motion'
import { LoginScreen } from './components/Login/LoginScreen'
import { AppShell } from './components/Layout/AppShell'
import { FlameIcon } from './components/icons/Icons'
import { useAuth } from './hooks/useAuth'
import { firebaseConfigured } from './lib/firebase'

export default function App() {
  const { user, profile, loading, error, emailLinkSent, signInGoogle, sendEmailLink, signOutUser } = useAuth()

  if (!firebaseConfigured) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-app-light px-6">
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <FlameIcon className="h-7 w-7 text-accent-light" />
          <div className="font-display text-lg font-semibold text-ink-1-light">Hearth isn't configured yet</div>
          <div className="text-sm leading-relaxed text-ink-2-light">
            Add your Firebase project's config values to <code className="rounded border border-border-light bg-card-light px-1 py-0.5">.env</code> (copy{' '}
            <code className="rounded border border-border-light bg-card-light px-1 py-0.5">.env.example</code> to get started), then restart the dev server.
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-app">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FlameIcon className="h-8 w-8 text-accent" />
        </motion.div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div key="login" exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="h-screen w-full">
          <LoginScreen onGoogle={signInGoogle} onEmailLink={sendEmailLink} error={error} emailLinkSent={emailLinkSent} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="h-screen w-full"
        >
          <AppShell uid={user.uid} profile={profile} onSignOut={signOutUser} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
