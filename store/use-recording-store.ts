import { create } from "zustand"
import { Room } from "livekit-client"

interface RecordingStore {
  room: Room | null
  isRecording: boolean
  setRoom: (room: Room | null) => void
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
}

export const useRecordingStore = create<RecordingStore>((set, get) => ({
  room: null,
  isRecording: false,
  setRoom: (room) => set({ room }),
  startRecording: async () => {
    const { room } = get()
    if (!room) return

    try {
      // Here you would typically make an API call to your recording service
      // For now, we'll just set the state
      set({ isRecording: true })
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  },
  stopRecording: async () => {
    const { room } = get()
    if (!room) return

    try {
      // Here you would typically make an API call to your recording service
      // For now, we'll just set the state
      set({ isRecording: false })
    } catch (error) {
      console.error('Failed to stop recording:', error)
      throw error
    }
  },
}))
