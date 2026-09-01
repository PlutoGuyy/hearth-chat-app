import { useEffect, useState } from 'react'
import { listenToAllProfiles, listenToUserRooms } from '../lib/rooms'
import type { Room, UserProfile } from '../types'

export function useRooms(uid: string | null) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({})

  useEffect(() => {
    if (!uid) {
      setRooms([])
      return
    }
    return listenToUserRooms(uid, setRooms)
  }, [uid])

  useEffect(() => {
    return listenToAllProfiles((list) => {
      const map: Record<string, UserProfile> = {}
      list.forEach((p) => {
        map[p.uid] = p
      })
      setProfiles(map)
    })
  }, [])

  return { rooms, profiles }
}
