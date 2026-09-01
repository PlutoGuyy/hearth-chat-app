import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function setAvatarEmoji(uid: string, emoji: string | null) {
  await updateDoc(doc(db, 'users', uid), { avatarEmoji: emoji })
}
