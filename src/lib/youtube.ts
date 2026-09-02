export interface YouTubeEmbed {
  videoId: string
  start?: number
}

const YOUTUBE_URL_REGEX =
  /https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})\S*/i

export function extractYouTubeEmbed(text: string): YouTubeEmbed | null {
  const match = text.match(YOUTUBE_URL_REGEX)
  if (!match) return null

  const [url, videoId] = match
  const startMatch = url.match(/[?&](?:t|start)=(\d+)/)
  const start = startMatch ? parseInt(startMatch[1], 10) : undefined

  return { videoId, start }
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export function youtubeEmbedUrl({ videoId, start }: YouTubeEmbed): string {
  return `https://www.youtube.com/embed/${videoId}${start ? `?start=${start}` : ''}`
}
