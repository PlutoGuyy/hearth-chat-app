import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithCredential,
  signInWithEmailLink,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { invoke, isTauri } from '@tauri-apps/api/core'
import { auth, db } from './firebase'
import { MAIN_ROOM_ID } from '../types'

const PENDING_EMAIL_KEY = 'hearth:pendingEmail'

export class NotInvitedError extends Error {
  constructor() {
    super("That email hasn't been invited to Hearth yet.")
    this.name = 'NotInvitedError'
  }
}

export function subscribeToAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}

export async function signInWithGoogle() {
  if (isTauri()) return signInWithGoogleDesktop()

  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  await completeSignIn(result.user)
  return result.user
}

// Desktop apps can't use Firebase's popup/redirect helpers — Google blocks
// OAuth sign-in from embedded webviews outright. Instead the Rust side opens
// the system browser, runs a loopback HTTP server to catch Google's redirect
// (see src-tauri/src/lib.rs), and hands back real Google tokens here.
async function signInWithGoogleDesktop() {
  const { idToken, accessToken } = await invoke<{ idToken: string; accessToken: string }>('google_sign_in')
  const credential = GoogleAuthProvider.credential(idToken, accessToken)
  const result = await signInWithCredential(auth, credential)
  await completeSignIn(result.user)
  return result.user
}

export async function sendEmailSignInLink(email: string) {
  await sendSignInLinkToEmail(auth, email, {
    url: window.location.origin,
    handleCodeInApp: true,
  })
  window.localStorage.setItem(PENDING_EMAIL_KEY, email)
}

export function isEmailSignInLink(url: string) {
  return isSignInWithEmailLink(auth, url)
}

export async function completeEmailLinkSignIn(url: string) {
  let email = window.localStorage.getItem(PENDING_EMAIL_KEY)
  if (!email) {
    email = window.prompt('Confirm the email you used to request this link:')
  }
  if (!email) throw new Error('An email address is required to finish signing in.')

  const result = await signInWithEmailLink(auth, email, url)
  window.localStorage.removeItem(PENDING_EMAIL_KEY)
  await completeSignIn(result.user)
  return result.user
}

export async function signOut() {
  await firebaseSignOut(auth)
}

async function isAllowlisted(email: string) {
  const snap = await getDoc(doc(db, 'allowlist', email.toLowerCase()))
  return snap.exists()
}

async function completeSignIn(user: User) {
  const email = user.email
  if (!email || !(await isAllowlisted(email))) {
    await firebaseSignOut(auth)
    throw new NotInvitedError()
  }

  const userRef = doc(db, 'users', user.uid)
  const existing = await getDoc(userRef)

  if (!existing.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || email.split('@')[0],
      email,
      photoURL: user.photoURL || null,
      avatarEmoji: null,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    })

    await setDoc(
      doc(db, 'rooms', MAIN_ROOM_ID),
      {
        type: 'main',
        name: 'The Hearth',
        memberIds: arrayUnion(user.uid),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
      },
      { merge: true },
    )
  } else {
    await updateDoc(userRef, { lastSeen: serverTimestamp() })
  }
}
