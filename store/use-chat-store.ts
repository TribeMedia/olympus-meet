import { create } from "zustand"
import { type Room, DataPacket_Kind } from "livekit-client"

export interface ChatMessage {
  id: string
  sender: string
  text: string
  timestamp: number
  isLocal: boolean
  isPrivate: boolean
  recipient?: string
}

interface ChatStore {
  messages: Record<string, ChatMessage[]>
  room: Room | null
  addMessage: (roomName: string, message: ChatMessage) => void
  setRoom: (room: Room) => void
  sendMessage: (roomName: string, text: string, recipient?: string) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: {},
  room: null,
  addMessage: (roomName, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomName]: [...(state.messages[roomName] || []), message],
      },
    })),
  setRoom: (room) => set({ room }),
  sendMessage: (roomName, text, recipient) => {
    const { room } = get()
    if (!room) return

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      sender: room.localParticipant.identity,
      text,
      timestamp: Date.now(),
      isLocal: true,
      isPrivate: !!recipient,
      recipient,
    }

    const data = {
      type: "chat",
      message: text,
      recipient,
    }

    const payload = new TextEncoder().encode(JSON.stringify(data))

    if (recipient) {
      const participantSid = room.participants.get(recipient)?.sid
      if (participantSid) {
        room.localParticipant.publishData(payload, DataPacket_Kind.RELIABLE, [participantSid])
      }
    } else {
      room.localParticipant.publishData(payload, DataPacket_Kind.RELIABLE)
    }

    get().addMessage(roomName, message)
  },
}))

