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

## Desktop app (Tauri)

`src-tauri/` wraps the same frontend in a native window. Google sign-in needed its own path here: embedded webviews (including the one Tauri uses) can't host `signInWithPopup`, and — separately — Google deliberately blocks OAuth sign-in from any embedded webview as an anti-phishing measure, so `signInWithRedirect` doesn't work either. The desktop build instead opens your real system browser and runs a temporary local server (`src-tauri/src/lib.rs`, the `google_sign_in` command) to catch Google's redirect, following Google's own [loopback flow for installed apps](https://developers.google.com/identity/protocols/oauth2/native-app). Email-link sign-in isn't wired up for desktop yet — the emailed link would open in your regular browser and sign in there, not in the app window.

One-time setup for this to work:

1. **Google Cloud Console** (same project as Firebase) → APIs & Services → Credentials → **Create Credentials → OAuth client ID** → Application type **Desktop app** → any name (e.g. "Hearth Desktop") → Create. Copy the Client ID (and Client Secret — Google issues one for this type too, though it isn't treated as confidential for installed apps).
2. **Firebase Console** → Authentication → Sign-in method → **Google** provider → expand **"Safelist client IDs from external projects"** → paste the Client ID from step 1 → Add → Save. Without this, the desktop sign-in completes but Firebase rejects the resulting credential.
3. Add both values to `src-tauri/.env` (copy `src-tauri/.env.example` first):
   ```
   GOOGLE_DESKTOP_CLIENT_ID=...
   GOOGLE_DESKTOP_CLIENT_SECRET=...
   ```

Then run it:
```bash
npm run tauri dev
```

`src-tauri/build.rs` reads `src-tauri/.env` at **compile time** and bakes the two values into the binary (via `option_env!` in `lib.rs`) — they are not read from a file at runtime, so a compiled exe needs no companion `.env` to run. Whoever you share a build with gets the same OAuth client your build was made with; there's nothing further they need to configure.

### Portable single-file exe

```bash
npx tauri build --no-bundle
```

**Don't build this with a raw `cargo build --release`** — that bypasses the Tauri CLI's own build orchestration, and the resulting binary stays wired to load `http://localhost:5173` (the dev server URL) instead of the embedded production assets, so it just shows a connection-refused error on any machine that isn't also running `npm run dev`. `tauri build` runs `beforeBuildCommand` (`npm run build`) and correctly embeds the built `dist/` into the binary. `--no-bundle` skips wrapping it in an MSI/NSIS installer and leaves just the raw exe.

Produces exactly one file: `src-tauri/target/release/hearth.exe` (~12 MB). This is the actual app, not an installer — no install step, no Start Menu entry, just hand someone the file and they double-click it. Confirmed by copying it alone into an empty folder (no `dist/`, no `.env`, nothing else), launching it there, and checking its network connections directly — zero attempts to reach `localhost:5173`, confirming it's reading the embedded assets. It works standalone because Tauri embeds the built frontend into the binary at compile time, and `src-tauri/.cargo/config.toml` statically links the C runtime (`target-feature=+crt-static`) so it doesn't need the Visual C++ Redistributable installed either.

The one dependency that can't be eliminated is the **WebView2 Runtime** — it's what actually renders the UI, and Tauri doesn't bundle a browser engine the way Electron does (that's the whole size tradeoff). This ships with Windows 10/11 by default via Edge, so it's a non-issue on virtually any real machine; if it's ever somehow missing, Windows/Edge will prompt to install it, or grab it directly from https://developer.microsoft.com/microsoft-edge/webview2/.

Drop `--no-bundle` for a proper signed installer (MSI/NSIS) instead of a raw exe, if that's ever preferable — the static-CRT linking and compile-time credentials apply to both equally.

### Auto-updates

The app checks for a newer version on launch and shows a banner to update + restart in place (`UpdateBanner`, using `@tauri-apps/plugin-updater` + `@tauri-apps/plugin-process`). This only works for installed builds signed with the project's update key — running via `tauri dev` never shows it.

**Releasing an update:**
1. Bump the version in `src-tauri/tauri.conf.json` (and `package.json` to match, for sanity).
2. Commit, then tag and push:
   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```
3. `.github/workflows/release.yml` picks up the tag, builds Windows + Linux, signs the artifacts, and publishes a GitHub Release with `latest.json` automatically. Everyone's installed app picks it up next time they launch it.

This only works because the repo is public — GitHub Release assets on a private repo aren't fetchable via a plain URL, which is what the installed apps need. The update signing key is a separate concept from repo visibility: a keypair generated once via `tauri signer generate`, with the private half stored only as the `TAURI_SIGNING_PRIVATE_KEY` GitHub Actions secret (never committed) and the public half embedded in `tauri.conf.json` (`plugins.updater.pubkey`) — losing the private key would mean generating a new pair and everyone needing to manually reinstall once, so keep it backed up somewhere safe outside of GitHub too.

The web app's `.env` values and the desktop OAuth credentials are stored as repo secrets too (`VITE_FIREBASE_*`, `VITE_GIPHY_API_KEY`, `GOOGLE_DESKTOP_CLIENT_ID`/`SECRET`) so CI can reconstruct both `.env` files at build time — see the "write env files" step in the workflow.
