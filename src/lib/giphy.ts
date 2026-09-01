const API_KEY = import.meta.env.VITE_GIPHY_API_KEY

export const giphyConfigured = Boolean(API_KEY)

export class GiphyRateLimitedError extends Error {
  constructor() {
    super('GIF search is rate-limited right now — try again in a bit.')
    this.name = 'GiphyRateLimitedError'
  }
}

async function checkResponse(res: Response, action: string) {
  if (res.status === 429) throw new GiphyRateLimitedError()
  if (!res.ok) throw new Error(`Giphy ${action} failed (${res.status})`)
}

export interface GifResult {
  id: string
  description: string
  previewUrl: string
  sendUrl: string
}

interface GiphyImageRendition {
  url: string
}

interface GiphyResult {
  id: string
  title: string
  images: {
    fixed_width_small: GiphyImageRendition
    fixed_height: GiphyImageRendition
  }
}

function mapResults(results: GiphyResult[]): GifResult[] {
  return results
    .filter((r) => r.images.fixed_width_small?.url && r.images.fixed_height?.url)
    .map((r) => ({
      id: r.id,
      description: r.title,
      previewUrl: r.images.fixed_width_small.url,
      sendUrl: r.images.fixed_height.url,
    }))
}

export async function searchGifs(query: string, limit = 24): Promise<GifResult[]> {
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&rating=pg-13`
  const res = await fetch(url)
  await checkResponse(res, 'search')
  const data = (await res.json()) as { data: GiphyResult[] }
  return mapResults(data.data)
}

export async function trendingGifs(limit = 24): Promise<GifResult[]> {
  const url = `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=${limit}&rating=pg-13`
  const res = await fetch(url)
  await checkResponse(res, 'trending')
  const data = (await res.json()) as { data: GiphyResult[] }
  return mapResults(data.data)
}
