import { useState } from 'react'
import { GearIcon } from '../icons/Icons'
import { Avatar } from '../shared/Avatar'
import { InviteModal } from './InviteModal'
import { AvatarPickerModal } from './AvatarPickerModal'
import type { UserProfile } from '../../types'

interface UserFooterProps {
  profile: UserProfile | null
  fallbackName: string
  currentUid: string
  onSignOut: () => void
}

export function UserFooter({ profile, fallbackName, currentUid, onSignOut }: UserFooterProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const name = profile?.displayName || fallbackName

  return (
    <div className="relative flex items-center gap-2.5 border-t border-border px-4 py-3">
      <button
        type="button"
        onClick={() => setAvatarOpen(true)}
        className="relative h-[34px] w-[34px] flex-shrink-0"
        title="Change your avatar"
      >
        <Avatar profile={profile} fallbackLabel={name} size={34} variant="accent" />
        <div className="absolute -right-px -bottom-px h-[10px] w-[10px] rounded-full border-2 border-sidebar bg-presence" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-ink-1">{name}</div>
        <div className="text-[11px] text-ink-3">Online</div>
      </div>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-hover hover:text-ink-1"
      >
        <GearIcon className="h-[17px] w-[17px]" />
      </button>

      {menuOpen && (
        <div className="absolute right-3 bottom-14 z-10 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              setAvatarOpen(true)
            }}
            className="w-full px-4 py-2.5 text-left text-[13px] text-ink-1 transition-colors hover:bg-surface-hover"
          >
            Change avatar
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              setInviteOpen(true)
            }}
            className="w-full px-4 py-2.5 text-left text-[13px] text-ink-1 transition-colors hover:bg-surface-hover"
          >
            Invite a friend
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full px-4 py-2.5 text-left text-[13px] text-ink-1 transition-colors hover:bg-surface-hover"
          >
            Sign out
          </button>
        </div>
      )}

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} currentUid={currentUid} />
      <AvatarPickerModal open={avatarOpen} onClose={() => setAvatarOpen(false)} profile={profile} uid={currentUid} />
    </div>
  )
}
