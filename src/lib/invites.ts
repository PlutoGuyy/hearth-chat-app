import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export class AlreadyInvitedError extends Error {
  constructor() {
    super("That email's already invited.")
    this.name = 'AlreadyInvitedError'
  }
}

export async function inviteFriend(email: string, invitedBy: string) {
  const normalized = email.trim().toLowerCase()
  const ref = doc(db, 'allowlist', normalized)

  const existing = await getDoc(ref)
  if (existing.exists()) throw new AlreadyInvitedError()

  await setDoc(ref, { invited: true, invitedBy, invitedAt: serverTimestamp() })
}
