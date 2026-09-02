import { useMemo, useRef, useState } from 'react'
import { CloseIcon, EmojiIcon, PaperclipIcon, SendIcon } from '../icons/Icons'
import { GifPicker } from './GifPicker'
import { YouTubeEmbed } from './YouTubeEmbed'
import { notifyTyping, sendMessage, uploadAttachment } from '../../lib/rooms'
import { extractYouTubeEmbed } from '../../lib/youtube'
import type { GifResult } from '../../lib/giphy'
import type { Attachment } from '../../types'

const QUICK_EMOJI = ['😀', '😂', '😍', '👍', '🎉', '🔥', '😢', '🙏']

interface ComposerProps {
  roomId: string
  uid: string
  placeholder: string
}

export function Composer({ roomId, uid, placeholder }: ComposerProps) {
  const [text, setText] = useState('')
  const [pending, setPending] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [gifOpen, setGifOpen] = useState(false)
  const [embedDismissedFor, setEmbedDismissedFor] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const embed = useMemo(() => extractYouTubeEmbed(text), [text])
  const embedDismissed = !!embed && embedDismissedFor === embed.videoId

  async function handleSelectGif(gif: GifResult) {
    await sendMessage(roomId, uid, '', [
      { url: gif.sendUrl, path: `giphy:${gif.id}`, contentType: 'image/gif', name: gif.description || 'GIF' },
    ])
  }

  async function handleFile(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const attachment = await uploadAttachment(roomId, uid, file)
      setPending((p) => [...p, attachment])
    } catch (err) {
      console.error('[hearth] attachment upload failed:', err)
      setUploadError('Upload failed — check that Storage is set up in Firebase.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed && pending.length === 0) return
    setText('')
    const attachments = pending
    setPending([])
    await sendMessage(roomId, uid, trimmed, attachments, embedDismissed)
    setEmbedDismissedFor(null)
  }

  return (
    <div className="flex flex-shrink-0 flex-col gap-2 border-t border-border px-6 py-3.5">
      {uploadError && (
        <div className="pl-12 text-[12.5px] font-medium text-danger">{uploadError}</div>
      )}

      {embed && !embedDismissed && (
        <div className="pl-12">
          <YouTubeEmbed embed={embed} onRemove={() => setEmbedDismissedFor(embed.videoId)} className="max-w-[220px]" />
        </div>
      )}

      {pending.length > 0 && (
        <div className="flex gap-2 pl-12">
          {pending.map((att) => (
            <div key={att.path} className="relative">
              <img src={att.url} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setPending((p) => p.filter((a) => a.path !== att.path))}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-ink-1"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface-hover hover:text-ink-1 disabled:opacity-40"
        >
          <PaperclipIcon className="h-[19px] w-[19px]" />
        </button>

        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setGifOpen((v) => !v)}
            className={`flex h-[38px] w-[38px] items-center justify-center rounded-full text-[10px] font-bold tracking-wide transition-colors hover:bg-surface-hover hover:text-ink-1 ${
              gifOpen ? 'bg-surface-hover text-ink-1' : 'text-ink-2'
            }`}
          >
            GIF
          </button>
          <GifPicker open={gifOpen} onClose={() => setGifOpen(false)} onSelect={handleSelectGif} />
        </div>

        <div className="relative flex flex-1 items-center gap-2.5 rounded-[22px] bg-surface px-4 py-2.5">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              notifyTyping(roomId, uid)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[14px] text-ink-1 outline-none placeholder:text-ink-3"
          />
          <button type="button" onClick={() => setEmojiOpen((v) => !v)} className="text-ink-2 hover:text-ink-1">
            <EmojiIcon className="h-[19px] w-[19px]" />
          </button>

          {emojiOpen && (
            <div className="absolute bottom-[52px] right-0 flex flex-wrap gap-1 rounded-2xl border border-border bg-surface p-2 shadow-lg">
              {QUICK_EMOJI.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setText((t) => t + emoji)
                    setEmojiOpen(false)
                  }}
                  className="rounded-lg p-1.5 text-lg hover:bg-surface-hover"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSend}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent transition-opacity hover:opacity-90"
        >
          <SendIcon className="h-[17px] w-[17px] text-on-accent" />
        </button>
      </div>
    </div>
  )
}
