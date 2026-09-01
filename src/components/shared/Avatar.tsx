import { useState } from 'react'
import { initials } from '../../lib/roomDisplay'
import type { UserProfile } from '../../types'

interface AvatarProps {
  profile?: UserProfile | null
  // Used only when no profile is given — e.g. a group's "P+2" badge, or a "?" placeholder.
  fallbackLabel?: string
  size: number
  variant?: 'surface' | 'accent'
  className?: string
}

export function Avatar({ profile, fallbackLabel, size, variant = 'surface', className = '' }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false)

  const emoji = profile?.avatarEmoji
  const showPhoto = !emoji && profile?.photoURL && !imgFailed
  const text = emoji || (profile ? initials(profile.displayName) : fallbackLabel) || '?'

  const colors = variant === 'accent' ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-ink-2'

  if (showPhoto) {
    return (
      <img
        src={profile!.photoURL!}
        alt=""
        onError={() => setImgFailed(true)}
        className={`flex-shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-display font-semibold ${colors} ${className}`}
      style={{ width: size, height: size, fontSize: emoji ? size * 0.55 : size * 0.34 }}
    >
      {text}
    </div>
  )
}
