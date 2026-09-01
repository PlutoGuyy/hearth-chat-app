import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GiphyRateLimitedError, giphyConfigured, searchGifs, trendingGifs, type GifResult } from '../../lib/giphy'

function describeError(err: unknown): string {
  if (err instanceof GiphyRateLimitedError) return err.message
  return 'Could not load GIFs.'
}

interface GifPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (gif: GifResult) => void
}

export function GifPicker({ open, onClose, onSelect }: GifPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GifResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open || !giphyConfigured) return
    setLoading(true)
    setError(null)
    trendingGifs()
      .then(setResults)
      .catch((err) => {
        console.error('[hearth] giphy trending failed:', err)
        setError(describeError(err))
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open || !giphyConfigured) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      setError(null)
      const search = query.trim() ? searchGifs(query.trim()) : trendingGifs()
      search
        .then(setResults)
        .catch((err) => {
          console.error('[hearth] giphy search failed:', err)
          setError(describeError(err))
        })
        .finally(() => setLoading(false))
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-[52px] right-0 z-20 flex h-[360px] w-[320px] flex-col gap-2.5 rounded-2xl border border-border bg-surface p-3 shadow-lg"
        >
          {!giphyConfigured ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 text-center">
              <div className="text-[13px] font-semibold text-ink-1">GIF search isn't set up yet</div>
              <div className="text-[12px] text-ink-3">Add a Giphy API key to .env as VITE_GIPHY_API_KEY.</div>
            </div>
          ) : (
            <>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search GIFs"
                className="w-full rounded-xl border border-border bg-app px-3.5 py-2 text-[13px] text-ink-1 outline-none placeholder:text-ink-3 focus:border-accent"
              />
              <div className="flex-1 overflow-y-auto">
                {error && <div className="pt-6 text-center text-[12.5px] text-danger">{error}</div>}
                {!error && loading && results.length === 0 && (
                  <div className="pt-6 text-center text-[12.5px] text-ink-3">Loading…</div>
                )}
                {!error && !loading && results.length === 0 && (
                  <div className="pt-6 text-center text-[12.5px] text-ink-3">No GIFs found.</div>
                )}
                <div className="grid grid-cols-2 gap-1.5">
                  {results.map((gif) => (
                    <button
                      key={gif.id}
                      type="button"
                      onClick={() => {
                        onSelect(gif)
                        onClose()
                        setQuery('')
                      }}
                      className="aspect-square overflow-hidden rounded-lg bg-surface-2 transition-opacity hover:opacity-80"
                    >
                      <img src={gif.previewUrl} alt={gif.description} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
