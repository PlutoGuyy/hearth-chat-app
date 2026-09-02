import { useState } from 'react'
import { CloseIcon } from '../icons/Icons'
import { youtubeEmbedUrl, youtubeThumbnailUrl, type YouTubeEmbed as YouTubeEmbedData } from '../../lib/youtube'

interface YouTubeEmbedProps {
  embed: YouTubeEmbedData
  onRemove?: () => void
  className?: string
}

export function YouTubeEmbed({ embed, onRemove, className = '' }: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className={`group/embed relative aspect-video w-full max-w-[360px] overflow-hidden rounded-xl bg-surface-2 ${className}`}>
      {playing ? (
        <iframe
          src={youtubeEmbedUrl(embed)}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="YouTube video"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="relative h-full w-full">
          <img src={youtubeThumbnailUrl(embed.videoId)} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/35">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </button>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover/embed:opacity-100 hover:bg-black/80"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
