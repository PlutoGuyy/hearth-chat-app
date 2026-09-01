import { ChatBubbleIcon } from '../icons/Icons'

interface EmptyStateProps {
  title: string
  subtitle: string
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3.5">
      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-surface">
        <ChatBubbleIcon className="h-[22px] w-[22px] text-ink-3" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="text-[14.5px] font-semibold text-ink-1">{title}</div>
        <div className="text-center text-[12.5px] text-ink-3">{subtitle}</div>
      </div>
    </div>
  )
}

export function MessageSkeleton() {
  const widths = [190, 140, 160, 200]
  return (
    <div className="flex flex-col gap-3">
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-[34px] animate-pulse rounded-2xl bg-surface"
          style={{ width: w, alignSelf: i === 2 ? 'flex-end' : 'flex-start', animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}
