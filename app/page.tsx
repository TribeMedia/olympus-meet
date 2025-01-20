"use client"

import { useState } from "react"
import { VideoConference } from "@/components/video-conference/video-conference"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Settings, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoginForm } from "@/components/login-form"
import { useAuthStore } from "@/store/use-auth-store"
import { CustomSetupSheet, type CustomSetupSettings } from "@/components/custom-setup-sheet"
import { toast } from "sonner"
import { PreJoinDialog } from "@/components/pre-join-dialog"
import { ThemeSwitcher } from "@/components/theme-switcher"
import ErrorBoundary from "@/components/error-boundary"

const MEET_URL = "https://meet.prometheus-platform.io"

export const dynamic = "force-dynamic"
export const runtime = "edge"

export default function Home() {
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState("")
  const [username, setUsername] = useState("")
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
    if (!username && !isAuthenticated) {
      console.error("Username not provided and user not authenticated")
      toast.error("Please enter a username or log in with BlueSky")
      return
    }
    setIsCustomSetupOpen(false)
    setIsPreJoinOpen(true)
  }

  const handleSaveSettings = (settings: CustomSetupSettings) => {
    setCustomSettings(settings)
    setIsCustomSetupOpen(false)
  }

  const handleStartMeeting = () => {
    if (!username && !isAuthenticated) {
      console.error("Username not provided and user not authenticated")
      toast.error("Please enter a username or log in with BlueSky")
      return
    }
    setIsPreJoinOpen(true)
  }

  const handleJoinRoom = async (token: string) => {
    setToken(token)
  }

  if (token) {
    return (
      <ErrorBoundary
        fallback={<div>Something went wrong in the video conference. Please try refreshing the page.</div>}
      >
        <VideoConference token={token} roomName={roomName} />
      </ErrorBoundary>
    )
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
              <a href="https://olympus.prometheus-platform.io" className="hidden md:inline text-sm hover:text-primary">
                Olympus Social
              </a>
              <a href="#" className="hidden md:inline text-sm hover:text-primary">
                GitHub
              </a>
              <ThemeSwitcher />
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative min-h-screen flex items-center justify-center px-6">
          {/* Background Image */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage:
                "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cover.png-AuIr4WiQWqVDA2XUqn8340Hc28xd87.webp)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-background/50 dark:bg-background/80" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">Olympus Meet</h1>
            <p className="text-lg md:text-xl text-center text-muted-foreground max-w-2xl mb-12">
              Experience enterprise-grade video conferencing built for the Olympus social network. Connect, collaborate,
              and communicate with unparalleled security and clarity.
            </p>

            <Card className="w-full max-w-md bg-background/80 border-border p-6 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4">Start or Join Meeting</h2>
              <p className="text-sm text-muted-foreground mb-4">Enter a room name or use the generated one</p>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Room Name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary/80"
                      onClick={() => setRoomName(`golden-prism-${Math.random().toString(36).substr(2, 8)}`)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setIsCustomSetupOpen(true)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {!isAuthenticated && (
                  <Input
                    type="text"
                    placeholder="Your Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground"
                  />
                )}
                <Button
                  onClick={handleStartMeeting}
                  className={cn(
                    "w-full bg-primary text-primary-foreground hover:bg-primary/90",
                    "transition-colors duration-200",
                  )}
                >
                  Start Meeting
                </Button>
              </div>
            </Card>

            {/* Hidden Login Form */}
            <div id="loginForm" className="fixed inset-0 bg-background/50 flex items-center justify-center hidden">
              <div className="relative">
                <Button
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  variant="ghost"
                  onClick={() => document.getElementById("loginForm")?.classList.add("hidden")}
                >
                  ✕
                </Button>
                <LoginForm />
              </div>
            </div>

            {/* Setup Sheets and Dialogs */}
            <CustomSetupSheet
              roomName={roomName}
              open={isCustomSetupOpen}
              onOpenChange={setIsCustomSetupOpen}
              onSave={handleSaveSettings}
              onConnect={handleCustomSetup}
            />
            <PreJoinDialog
              roomName={roomName}
              open={isPreJoinOpen}
              onOpenChange={setIsPreJoinOpen}
              onJoin={handleJoinRoom}
            />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
