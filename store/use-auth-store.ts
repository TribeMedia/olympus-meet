import { create } from "zustand"
import { persist } from "zustand/middleware"
import { AtpAgent, AtpSessionData } from "@atproto/api"

interface AuthState {
  session: AtpSessionData | null
  isAuthenticated: boolean
  login: (identifier: string, password: string, service?: string) => Promise<void>
  logout: () => void
  getAgent: () => AtpAgent | null
}

const createAgent = (service: string = "https://bsky.social") => {
  return new AtpAgent({ service })
}

let agent: AtpAgent | null = null

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,
      getAgent: () => agent,
      login: async (identifier: string, password: string, service = "https://bsky.social") => {
        agent = createAgent(service)
        try {
          const { success, data } = await agent.login({ identifier, password })
          if (success && data) {
            const sessionData: AtpSessionData = {
              ...data,
              active: true,
            }
            set({
              session: sessionData,
              isAuthenticated: true,
            })
          }
        } catch (error) {
          console.error("Login failed:", error)
          throw error
        }
      },
      logout: () => {
        if (agent) {
          agent.logout().catch(console.error)
        }
        agent = null
        set({
          session: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
