import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const app = initializeApp(firebaseConfig)

// When .env hasn't been filled in yet, the SDK throws synchronously on
// invalid-looking config (e.g. an empty API key). Fall back to inert
// handles so the app can still boot and show a setup message instead
// of a blank white screen — callers must check `firebaseConfigured`
// before actually using auth/db/storage.
export let auth: Auth
export let db: Firestore
export let storage: FirebaseStorage

try {
  auth = getAuth(app)
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
  storage = getStorage(app)
} catch {
  auth = null as unknown as Auth
  db = null as unknown as Firestore
  storage = null as unknown as FirebaseStorage
}
