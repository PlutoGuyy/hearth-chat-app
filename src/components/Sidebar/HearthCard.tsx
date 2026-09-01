import { motion } from 'framer-motion'
import { FlameIcon } from '../icons/Icons'

interface HearthCardProps {
  active: boolean
  onlineCount: number
  totalCount: number
  onClick: () => void
}

export function HearthCard({ active, onlineCount, totalCount, onClick }: HearthCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className={`mx-3 mt-1.5 mb-4 flex items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition-colors ${
        active
          ? 'border-accent-soft-border bg-accent-soft'
          : 'border-transparent bg-surface hover:bg-surface-hover'
      }`}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent">
        <FlameIcon className="h-5 w-5 text-on-accent" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-[14.5px] font-semibold text-ink-1">The Hearth</div>
        <div className="mt-px text-xs text-ink-2">
          {totalCount} friend{totalCount === 1 ? '' : 's'} · {onlineCount} online
        </div>
      </div>
    </motion.button>
  )
}
