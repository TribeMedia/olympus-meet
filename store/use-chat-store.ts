import { create } from "zustand"
import { type Room, DataPacket_Kind } from "livekit-client"

export interface ChatMessage {
  id: string
  message: string
  from: {
    identity: string
    name?: string
  }
  timestamp: number
  isSelf: boolean
  roomName: string
  status: 'sending' | 'sent' | 'error'
}

interface ChatStore {
  isOpen: boolean
  messages: Record<string, ChatMessage[]>
  room: Room | null
  toggleChat: () => void
  closeChat: () => void
  addMessage: (message: ChatMessage) => void
  setRoom: (room: Room) => void
  sendMessage: (text: string) => Promise<void>
  getMessagesForRoom: (roomName: string) => ChatMessage[]
}

export const useChatStore = create<ChatStore>((set, get) => ({
  isOpen: false,
  messages: {},
  room: null,
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  closeChat: () => set({ isOpen: false }),
  addMessage: (message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [message.roomName]: [...(state.messages[message.roomName] || []), message],
      },
    })),
  setRoom: (room) => set({ room }),
  getMessagesForRoom: (roomName) => {
    return get().messages[roomName] || []
  },
  sendMessage: async (text) => {
    const { room } = get()
    if (!room) throw new Error("Room not found")

    const messageId = `${Date.now()}-${Math.random()}`
    const message: ChatMessage = {
      id: messageId,
      message: text,
      from: {
        identity: room.localParticipant.identity,
        name: room.localParticipant.name
      },
      timestamp: Date.now(),
      isSelf: true,
      roomName: room.name,
      status: 'sending'
    }

    // Add message immediately with 'sending' status
    get().addMessage(message)

    try {
      const payload = new TextEncoder().encode(text)
      await room.localParticipant.publishData(payload, {
        reliable: true,
        topic: 'chat'
      })
      
      // Update message status to 'sent'
      set((state) => ({
        messages: {
          ...state.messages,
          [room.name]: state.messages[room.name].map((msg) =>
            msg.id === messageId ? { ...msg, status: 'sent' as const } : msg
          ),
        },
      }))
    } catch (error) {
      // Update message status to 'error'
      set((state) => ({
        messages: {
          ...state.messages,
          [room.name]: state.messages[room.name].map((msg) =>
            msg.id === messageId ? { ...msg, status: 'error' as const } : msg
          ),
        },
      }))
      throw error
    }
  },
}))
