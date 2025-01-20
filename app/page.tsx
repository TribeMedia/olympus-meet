"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Settings, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoginForm } from "@/components/login-form"
import { useAuthStore } from "@/store/use-auth-store"
import { CustomSetupSheet, type CustomSetupSettings } from "@/components/custom-setup-sheet"
import { toast } from "sonner"
import { ThemeSwitcher } from "@/components/theme-switcher"
import ErrorBoundary from "@/components/error-boundary"
import { generateRoomName } from "@/lib/room-utils"
import { useRouter } from "next/navigation"
import { PreJoinDialog } from "@/components/pre-join-dialog"

export const dynamic = "force-dynamic"
export const runtime = "edge"

export default function Home() {
  const [roomName, setRoomName] = useState(() => generateRoomName())
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const session = useAuthStore((state) => state.session)
  const logout = useAuthStore((state) => state.logout)
  const [isCustomSetupOpen, setIsCustomSetupOpen] = useState(false)
  const [isPreJoinOpen, setIsPreJoinOpen] = useState(false)
  const [customSettings, setCustomSettings] = useState<CustomSetupSettings>({
    pdsServerUrl: "https://bsky.social",
    livekitServerUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://livekit.prometheus-platform.io",
    enableE2EE: false,
  })

  const handleCustomSetup = async (settings: CustomSetupSettings) => {
    setCustomSettings(settings)
    setIsCustomSetupOpen(false)
    setIsPreJoinOpen(true)
  }

  const handleSaveSettings = (settings: CustomSetupSettings) => {
    setCustomSettings(settings)
    setIsCustomSetupOpen(false)
  }

  const handleStartMeeting = () => {
    setIsPreJoinOpen(true)
  }

  const handleJoinRoom = async (token: string) => {
    router.push(`/rooms/${roomName}?token=${encodeURIComponent(token)}`)
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try refreshing the page.</div>}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6" />
              <span className="text-lg font-semibold">Olympus Meet</span>
            </div>
            <nav className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-muted-foreground">Signed in as {session?.handle}</span>
                  <Button variant="ghost" className="text-sm hover:text-primary" onClick={logout}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="text-sm hover:text-primary"
                  onClick={() => document.getElementById("loginForm")?.classList.remove("hidden")}
                >
                  Sign In with BlueSky
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsCustomSetupOpen(true)}>
                <Settings className="w-5 h-5" />
              </Button>
              <ThemeSwitcher />
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <Card className="w-full max-w-md p-6 space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Welcome to Olympus Meet</h1>
              <p className="text-sm text-muted-foreground">
                Start or join a meeting with high-quality video and screen sharing
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleStartMeeting}>
                Start Meeting
              </Button>
            </div>
          </Card>
        </main>

        {/* Login Form */}
        <LoginForm />

        {/* Custom Setup Sheet */}
        <CustomSetupSheet
          roomName={roomName}
          open={isCustomSetupOpen}
          onOpenChange={setIsCustomSetupOpen}
          onSave={handleSaveSettings}
          onConnect={handleCustomSetup}
        />

        {/* Pre Join Dialog */}
        <PreJoinDialog
          open={isPreJoinOpen}
          onOpenChange={setIsPreJoinOpen}
          roomName={roomName}
          onJoin={handleJoinRoom}
          defaultUsername={isAuthenticated ? session?.handle : undefined}
        />
      </div>
    </ErrorBoundary>
  )
}
