import { create } from "zustand"
import { persist } from "zustand/middleware"
import { BskyAgent } from "@atproto/api"

interface AuthState {
  agent: BskyAgent | null
  session: { did: string; handle: string; email?: string } | null
  isAuthenticated: boolean
  login: (identifier: string, password: string, service?: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      agent: null,
      session: null,
      isAuthenticated: false,
      login: async (identifier: string, password: string, service = "https://bsky.social") => {
        const agent = new BskyAgent({ service })
        try {
          const { success, data } = await agent.login({ identifier, password })
          if (success) {
            set({
              agent,
              session: {
                did: data.did,
                handle: data.handle,
                email: data.email,
              },
              isAuthenticated: true,
            })
          }
        } catch (error) {
          console.error("Login failed:", error)
          throw error
        }
      },
      logout: () => {
        set({
          agent: null,
          session: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    },
  ),
)

