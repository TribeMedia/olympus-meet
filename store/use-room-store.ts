import { create } from "zustand"
import type { Room } from "livekit-client"

interface RoomStore {
  room: Room | null
  setRoom: (room: Room) => void
}

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  setRoom: (room) => set({ room }),
}))

