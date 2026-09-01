import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, firebaseConfigured } from '../lib/firebase'
import {
  NotInvitedError,
  completeEmailLinkSignIn,
  isEmailSignInLink,
  sendEmailSignInLink,
  signInWithGoogle,
  signOut,
  subscribeToAuth,
} from '../lib/auth'
import { startPresenceHeartbeat } from '../lib/presence'
import type { UserProfile } from '../types'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  emailLinkSent: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    emailLinkSent: false,
  })

  useEffect(() => {
    if (!firebaseConfigured) {
      setState((s) => ({ ...s, loading: false }))
      return
    }

    let stopPresence: (() => void) | null = null
    let stopProfile: (() => void) | null = null

    const unsubAuth = subscribeToAuth((user) => {
      stopProfile?.()
      stopPresence?.()

      if (!user) {
        setState((s) => ({ ...s, user: null, profile: null, loading: false }))
        return
      }

      setState((s) => ({ ...s, user, loading: false }))
      stopPresence = startPresenceHeartbeat(user.uid)
      stopProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
          if (snap.exists()) {
            setState((s) => ({ ...s, profile: { uid: snap.id, ...snap.data() } as UserProfile }))
          }
        },
        (err) => console.error('[hearth] own profile listener failed:', err),
      )
    })

    if (isEmailSignInLink(window.location.href)) {
      completeEmailLinkSignIn(window.location.href)
        .then(() => {
          window.history.replaceState({}, '', window.location.pathname)
        })
        .catch((err) => {
          setState((s) => ({ ...s, error: describeError(err), loading: false }))
        })
    }

    return () => {
      unsubAuth()
      stopPresence?.()
      stopProfile?.()
    }
  }, [])

  const signInGoogle = async () => {
    setState((s) => ({ ...s, error: null }))
    try {
      await signInWithGoogle()
    } catch (err) {
      setState((s) => ({ ...s, error: describeError(err) }))
    }
  }

  const sendEmailLink = async (email: string) => {
    setState((s) => ({ ...s, error: null }))
    try {
      await sendEmailSignInLink(email)
      setState((s) => ({ ...s, emailLinkSent: true }))
    } catch (err) {
      setState((s) => ({ ...s, error: describeError(err) }))
    }
  }

  const signOutUser = () => signOut()

  return { ...state, signInGoogle, sendEmailLink, signOutUser }
}

function describeError(err: unknown): string {
  if (err instanceof NotInvitedError) return err.message
  if (err instanceof Error) return err.message
  return 'Something went wrong. Try again.'
}
