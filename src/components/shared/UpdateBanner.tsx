import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { isTauri } from '@tauri-apps/api/core'
import { check, type Update } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

type Status = 'idle' | 'available' | 'downloading' | 'restarting' | 'error'

export function UpdateBanner() {
  const [update, setUpdate] = useState<Update | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isTauri()) return
    check()
      .then((result) => {
        if (result?.available) {
          setUpdate(result)
          setStatus('available')
        }
      })
      .catch((err) => console.error('[hearth] update check failed:', err))
  }, [])

  async function handleUpdate() {
    if (!update) return
    setStatus('downloading')
    setError(null)
    let downloaded = 0
    let total = 0
    try {
      await update.downloadAndInstall((event) => {
        if (event.event === 'Started') total = event.data.contentLength ?? 0
        if (event.event === 'Progress') {
          downloaded += event.data.chunkLength
          setProgress(total ? Math.min(100, Math.round((downloaded / total) * 100)) : 0)
        }
      })
      setStatus('restarting')
      await relaunch()
    } catch (err) {
      console.error('[hearth] update install failed:', err)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Update failed — try again later.')
    }
  }

  return (
    <AnimatePresence initial={false}>
      {status !== 'idle' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex flex-shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-accent-soft-border bg-accent-soft px-4 py-2"
        >
          {status === 'available' && (
            <>
              <span className="text-[13px] text-ink-1">
                A new version of Hearth is available{update?.version ? ` (${update.version})` : ''}.
              </span>
              <button
                type="button"
                onClick={handleUpdate}
                className="flex-shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-[12.5px] font-semibold text-on-accent transition-opacity hover:opacity-90"
              >
                Update &amp; restart
              </button>
            </>
          )}
          {status === 'downloading' && <span className="text-[13px] text-ink-1">Downloading update… {progress}%</span>}
          {status === 'restarting' && <span className="text-[13px] text-ink-1">Restarting…</span>}
          {status === 'error' && <span className="text-[13px] text-danger">{error}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
