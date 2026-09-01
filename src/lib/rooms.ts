import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDocs,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from './firebase'
import type { Attachment, Message, Room, TypingState, UserProfile } from '../types'
import { TYPING_STALE_MS } from '../types'

function roomsCol() {
  return collection(db, 'rooms')
}
function messagesCol(roomId: string) {
  return collection(db, 'rooms', roomId, 'messages')
}
function typingCol(roomId: string) {
  return collection(db, 'rooms', roomId, 'typing')
}

export function listenToUserRooms(uid: string, cb: (rooms: Room[]) => void): Unsubscribe {
  // No orderBy here on purpose: array-contains + orderBy on a different
  // field needs a composite index deployed in Firestore first. Sorting
  // the (small) room list client-side avoids that extra setup step.
  const q = query(roomsCol(), where('memberIds', 'array-contains', uid))
  return onSnapshot(
    q,
    (snap) => {
      const rooms = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Room)
      rooms.sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0))
      cb(rooms)
    },
    (err) => console.error('[hearth] room list listener failed:', err),
  )
}

export function listenToMessages(roomId: string, cb: (messages: Message[]) => void): Unsubscribe {
  const q = query(messagesCol(roomId), orderBy('createdAt', 'asc'), limitToLast(80))
  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message))
    },
    (err) => console.error('[hearth] messages listener failed:', err),
  )
}

export async function sendMessage(
  roomId: string,
  senderId: string,
  text: string,
  attachments: Attachment[] = [],
) {
  const trimmed = text.trim()
  if (!trimmed && attachments.length === 0) return

  await addDoc(messagesCol(roomId), {
    text: trimmed,
    senderId,
    createdAt: serverTimestamp(),
    editedAt: null,
    deletedAt: null,
    attachments,
    reactions: {},
  })

  await updateDoc(doc(db, 'rooms', roomId), {
    updatedAt: serverTimestamp(),
    lastMessage: {
      text: trimmed || (attachments.length ? 'Sent a photo' : ''),
      senderId,
      createdAt: serverTimestamp(),
    },
  })

  await setTyping(roomId, senderId, false)
}

export async function editMessage(roomId: string, messageId: string, text: string) {
  await updateDoc(doc(db, 'rooms', roomId, 'messages', messageId), {
    text: text.trim(),
    editedAt: serverTimestamp(),
  })
}

export async function deleteMessage(roomId: string, messageId: string) {
  await updateDoc(doc(db, 'rooms', roomId, 'messages', messageId), {
    text: '',
    attachments: [],
    deletedAt: serverTimestamp(),
  })
}

export async function toggleReaction(roomId: string, messageId: string, uid: string, emoji: string, add: boolean) {
  await updateDoc(doc(db, 'rooms', roomId, 'messages', messageId), {
    [`reactions.${emoji}`]: add ? arrayUnion(uid) : arrayRemove(uid),
  })
}

export function listenToTyping(roomId: string, selfUid: string, cb: (typingUids: string[]) => void): Unsubscribe {
  return onSnapshot(
    typingCol(roomId),
    (snap) => {
      const now = Date.now()
      const active = snap.docs
        .map((d) => ({ uid: d.id, ...d.data() }) as TypingState & { uid: string })
        .filter((t) => t.uid !== selfUid && t.typing && t.updatedAt && now - t.updatedAt.toMillis() < TYPING_STALE_MS)
        .map((t) => t.uid)
      cb(active)
    },
    (err) => console.error('[hearth] typing listener failed:', err),
  )
}

let typingTimeout: ReturnType<typeof setTimeout> | null = null

export async function setTyping(roomId: string, uid: string, typing: boolean) {
  await setDoc(
    doc(db, 'rooms', roomId, 'typing', uid),
    { typing, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export function notifyTyping(roomId: string, uid: string) {
  setTyping(roomId, uid, true).catch(() => {})
  if (typingTimeout) clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    setTyping(roomId, uid, false).catch(() => {})
  }, 3000)
}

// Stored as a map on the room doc itself (rooms/{roomId}.lastRead.{uid})
// rather than a subcollection, so read receipts and unread badges ride
// the room-list listener every client already keeps open — no extra
// per-room listeners needed.
export async function markRead(roomId: string, uid: string) {
  await updateDoc(doc(db, 'rooms', roomId), { [`lastRead.${uid}`]: serverTimestamp() })
}

export async function findOrCreateDirectRoom(currentUid: string, otherUid: string): Promise<string> {
  const pair = [currentUid, otherUid].sort()
  const q = query(roomsCol(), where('type', '==', 'dm'), where('memberIds', '==', pair))
  const existing = await getDocs(q)
  if (!existing.empty) return existing.docs[0].id

  const newRoom = await addDoc(roomsCol(), {
    type: 'dm',
    name: null,
    memberIds: pair,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: currentUid,
    lastMessage: null,
  })
  return newRoom.id
}

export async function createGroupRoom(currentUid: string, memberUids: string[], name: string): Promise<string> {
  const memberIds = Array.from(new Set([currentUid, ...memberUids])).sort()
  const newRoom = await addDoc(roomsCol(), {
    type: 'group',
    name: name.trim() || null,
    memberIds,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: currentUid,
    lastMessage: null,
  })
  return newRoom.id
}

export function listenToAllProfiles(cb: (profiles: UserProfile[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'users'),
    (snap) => {
      cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserProfile))
    },
    (err) => console.error('[hearth] profiles listener failed:', err),
  )
}

export async function uploadAttachment(roomId: string, uid: string, file: File): Promise<Attachment> {
  const path = `attachments/${roomId}/${uid}/${Date.now()}-${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return { url, path, contentType: file.type, name: file.name }
}

export const clearField = deleteField
