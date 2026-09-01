import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function FlameIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.9 2.3c.7 2.9-2.4 4.6-2.4 8a3.5 3.5 0 0 0 7 0c0-1-.3-1.8-.8-2.4.2 1.7-.9 2.6-1.9 2.6-1.2 0-1.8-1.3-.9-2.7 1.5-2.4 1-4.3-1-5.5Z" />
      <path d="M9.2 11.6C7.9 13.1 7 14.6 7 16.5a5 5 0 0 0 10 0c0-1.5-.5-2.6-1.1-3.6.2 2.1-1.2 3.3-2.6 3.3-1.5 0-2.4-1.3-1.7-2.9.3-.7.2-1.2-.4-1.7-.7.4-1.3.7-2 2Z" />
    </svg>
  )
}

export function GearIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.9-1.5-2-3.4-2.2.9a7.5 7.5 0 0 0-2.6-1.5L14 2h-4l-.5 2.9a7.5 7.5 0 0 0-2.6 1.5l-2.2-.9-2 3.4L4.6 10.5a7.6 7.6 0 0 0 0 3L2.7 15l2 3.4 2.2-.9c.8.7 1.7 1.2 2.6 1.5L10 22h4l.5-2.9a7.5 7.5 0 0 0 2.6-1.5l2.2.9 2-3.4-1.9-1.6Z" />
    </svg>
  )
}

export function PlusIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function SearchIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true" {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.3-4.3" />
    </svg>
  )
}

export function PaperclipIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M17.5 8.5 9 17a3 3 0 0 1-4.2-4.2l8.5-8.5a2 2 0 0 1 2.8 2.8L7.6 15.6a1 1 0 0 1-1.4-1.4l6.9-6.9" />
    </svg>
  )
}

export function EmojiIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 10h.01M15 10h.01" />
      <path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2" />
    </svg>
  )
}

export function SendIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 11.5 20 4l-6.5 17-2.7-6.8L3 11.5Z" />
    </svg>
  )
}

export function BackIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  )
}

export function CheckDoubleIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M2 12.5 6 16l4-4.5" />
      <path d="M9 12.5 13 16l9-10" />
    </svg>
  )
}

export function ImageIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.75" />
      <path d="m21 16-5.5-5.5L4 21" />
    </svg>
  )
}

export function ChatBubbleIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function ChevronDownIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function CloseIcon({ ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function GoogleLogo({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.24c1.9-1.75 3-4.32 3-7.36Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.4l-3.24-2.5c-.9.6-2.05.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H3.05v2.58A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.94a5.9 5.9 0 0 1 0-3.88V7.48H3.05a10 10 0 0 0 0 9.04l3.35-2.58Z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.48l3.35 2.58C7.2 7.74 9.4 5.98 12 5.98Z" />
    </svg>
  )
}
