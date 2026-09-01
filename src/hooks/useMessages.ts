import { useEffect, useState } from 'react'
import { listenToMessages, listenToTyping, markRead } from '../lib/rooms'
import type { Message } from '../types'

export function useMessages(roomId: string | null, uid: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUids, setTypingUids] = useState<string[]>([])

  useEffect(() => {
    if (!roomId) {
      setMessages([])
      return
    }
    return listenToMessages(roomId, setMessages)
  }, [roomId])

  useEffect(() => {
    if (!roomId || !uid) {
      setTypingUids([])
      return
    }
    return listenToTyping(roomId, uid, setTypingUids)
  }, [roomId, uid])

  useEffect(() => {
    if (!roomId || !uid || messages.length === 0) return
    markRead(roomId, uid).catch(() => {})
  }, [roomId, uid, messages.length])

  return { messages, typingUids }
}
