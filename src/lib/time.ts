import { format, isToday, isYesterday } from 'date-fns'
import type { Timestamp } from 'firebase/firestore'

export function shortRelative(ts: Timestamp | null): string {
  if (!ts) return ''
  const date = ts.toDate()
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return format(date, 'MMM d')
}

export function messageTime(ts: Timestamp | null): string {
  if (!ts) return ''
  return format(ts.toDate(), 'h:mm a')
}

export function dayLabel(ts: Timestamp | null): string {
  if (!ts) return ''
  const date = ts.toDate()
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMM d')
}
