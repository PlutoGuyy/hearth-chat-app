# Hearth

A friends-only chat app: one always-on group room ("The Hearth") plus ad-hoc 1:1 and small group DMs. React + Vite + TypeScript + Tailwind + Firebase.

## Firebase project setup

1. Create a project at https://console.firebase.google.com (Native Firestore mode, not Datastore mode).
2. **Authentication** → Sign-in method → enable **Google** and **Email link (passwordless sign-in)**.
3. **Firestore Database** → create database (production mode, any region).
4. **Storage** → get started (used for image attachments).
5. Project settings → General → "Your apps" → add a **Web app** → copy the config values into `.env` (copy `.env.example` first).
6. **Invite yourself (bootstrap step, once)**: in Firestore, create a collection named `allowlist`, then add one document whose **document ID is your own lowercase email address** (give it any field — the console won't save a doc with zero fields — e.g. `invited: true`). Without an allowlist entry, sign-in is rejected even with a valid Google/email account — this is the friends-only gate. After this first entry, sign in once, then use the **Invite a friend** option in the app itself (gear menu, bottom-left) to add everyone else — no more touching the Firestore console.
7. Deploy security rules — either via the console (**Firestore Database → Rules** tab, paste in `firestore.rules`, Publish; **Storage → Rules** tab, paste in `storage.rules`, Publish), or with the [Firebase CLI](https://firebase.google.com/docs/cli):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add   # pick your project
   firebase deploy --only firestore:rules,storage
   ```
   No composite indexes are needed — the room-list query sorts client-side on purpose to avoid that extra setup step.
8. **GIF search (optional)**: get a free API key at https://developers.giphy.com/dashboard (sign in, "Create an App" → API). New keys start as a "beta" key — fine for this app, no approval needed (100 requests/hour, 1000/day, way more than a couple of friends will hit). Add it to `.env` as `VITE_GIPHY_API_KEY`. Without it, the GIF button explains it isn't set up yet instead of breaking.

If image attachments fail to upload, it's almost always step 4 or step 7 — either Storage was never actually created in the console, or `storage.rules` was never published. The composer now shows an inline error and logs `[hearth] attachment upload failed: ...` to the console when this happens, so check there first.

## Local development

```bash
npm install
npm run dev
```

The first person to sign in with an allowlisted email automatically becomes a member of The Hearth. Every subsequent allowlisted sign-in is added to it too.

## Notes on the data model

- `allowlist/{lowercaseEmail}` — invite list, managed by hand in the Firebase console.
- `users/{uid}` — profile + `lastSeen` heartbeat (presence is computed client-side: "online" if seen in the last 100s — no Realtime Database needed).
- `rooms/{roomId}` — `type: 'main' | 'dm' | 'group'`, `memberIds`, denormalized `lastMessage` for the sidebar preview, and a `lastRead.{uid}` map for read receipts/unread badges. The main room always has the fixed id `the-hearth`.
- `rooms/{roomId}/messages/{id}` — text, attachments, reactions map, soft-delete via `deletedAt`.
- `rooms/{roomId}/typing/{uid}` — ephemeral typing state, only listened to for the room you currently have open.

### Staying cheap on the free (Spark) plan

Read receipts live as a map field on the room doc rather than a `reads` subcollection, specifically so unread badges don't need a live listener per conversation — they ride the one room-list listener every client already keeps open. The only *other* rooms' data with a standing listener is the room list itself (previews/unread) and the friends' profile docs (names + online dots); actual messages and typing are only ever listened to for the room you have open. Presence writes on a 60s heartbeat while the tab is visible, which is the main lever if you ever need to cut reads further (each heartbeat is one read for every other connected client watching that profile).

## Deploying the app itself

```bash
npm run build
firebase deploy --only hosting
```

Once you deploy to a real domain (e.g. `chat.plutoguy.net`), add it under **Authentication → Settings → Authorized domains** in the console — Google/email-link sign-in only works from domains on that list (`localhost` is there by default).

## Standalone single-file build (backup)

```bash
npm run build:standalone
```

Produces two files in `dist-standalone/`:

- `hearth-full.html` — one self-contained file (JS + CSS inlined, ~1 MB). Keep a copy of it somewhere so you have a working Hearth even if `chat.plutoguy.net`'s hosting is ever down. It still needs internet access (it talks to Firebase and Google Fonts directly, same as the real site) — this only removes the dependency on that specific hosting.
- `Start Hearth.bat` — a Windows launcher. **Don't open `hearth-full.html` directly** — as a `file://` page, Google/email-link sign-in fails with an "unauthorized domain" error, because `file://` can never be added to Firebase's Authorized domains list (it's not something app code can work around). Double-click `Start Hearth.bat` instead: it starts a local server in the background (tries Python, then Node's `serve` as a fallback) and opens your browser to `http://localhost:8973/hearth-full.html` — since `localhost` is already an authorized domain, sign-in works normally. Keep both files in the same folder. A small "Hearth Server" window stays open while it runs; closing that window stops the server.

The launcher's source is `standalone-launcher.bat` in the project root — `npm run build:standalone` copies it into `dist-standalone/` (renamed) on every build, so it always ships alongside the html file automatically. On Mac/Linux, skip the launcher and just run `python -m http.server 8973` from the folder yourself, then open `http://localhost:8973/hearth-full.html`.
