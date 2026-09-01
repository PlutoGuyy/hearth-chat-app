import { motion } from 'framer-motion'

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-1 flex w-fit items-center gap-[5px] rounded-tr-2xl rounded-tl-[4px] rounded-b-2xl bg-surface px-4 py-3.5"
    >
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-2" style={{ animationDelay: '0s' }} />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-2" style={{ animationDelay: '0.15s' }} />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-2" style={{ animationDelay: '0.3s' }} />
    </motion.div>
  )
}
