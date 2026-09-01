import { doc, serverTimestamp, updateDoc, type Timestamp } from 'firebase/firestore'
import { db } from './firebase'
import { PRESENCE_STALE_MS } from '../types'

// Every heartbeat write is a read for each other client with a live
// listener on this user's profile (needed for the online dot) — keep
// this as infrequent as feels reasonable to stay cheap on Spark.
const HEARTBEAT_MS = 60_000

export function startPresenceHeartbeat(uid: string) {
  const ref = doc(db, 'users', uid)
  const beat = () => {
    if (document.visibilityState === 'visible') {
      updateDoc(ref, { lastSeen: serverTimestamp() }).catch(() => {})
    }
  }

  beat()
  const interval = window.setInterval(beat, HEARTBEAT_MS)
  document.addEventListener('visibilitychange', beat)
  window.addEventListener('beforeunload', beat)

  return () => {
    window.clearInterval(interval)
    document.removeEventListener('visibilitychange', beat)
    window.removeEventListener('beforeunload', beat)
  }
}

export function isOnline(lastSeen: Timestamp | null): boolean {
  if (!lastSeen) return false
  return Date.now() - lastSeen.toMillis() < PRESENCE_STALE_MS
}
