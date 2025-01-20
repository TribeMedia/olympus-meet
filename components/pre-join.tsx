"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { usePreJoinStore } from "@/store/use-pre-join-store"
import { useAuthStore } from "@/store/use-auth-store"
import { toast } from "sonner"

interface PreJoinProps {
  roomName: string
  onJoin: (token: string) => void
}

export function PreJoin({ roomName, onJoin }: PreJoinProps) {
  const { formData, setFormData, resetForm } = usePreJoinStore()
  const { isAuthenticated, session } = useAuthStore()

  // If user is authenticated, use their handle as display name
  useEffect(() => {
    if (isAuthenticated && session?.handle) {
      setFormData({ displayName: session.handle })
    }
  }, [isAuthenticated, session?.handle, setFormData])

  const handleJoin = async () => {
    try {
      if (!formData.displayName) {
        toast.error("Please enter a display name")
        return
      }

      const response = await fetch(`/api/livekit-token?room=${roomName}&username=${formData.displayName}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "Failed to join room")

      if (formData.shareOnSocial && isAuthenticated) {
        // Post to Olympus Social
        try {
          const agent = useAuthStore.getState().agent
          await agent?.post({
            text: `I'm live in a meeting! Join me at: https://meet.prometheus-platform.io/${roomName}`,
            // You can add more rich embed data here
          })
        } catch (error) {
          console.error("Failed to share on social:", error)
          // Don't block joining if sharing fails
        }
      }

      onJoin(data.token)
    } catch (error) {
      toast.error("Failed to join room")
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Meeting</CardTitle>
          <CardDescription>Enter your details to join {roomName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your name"
              value={formData.displayName}
              onChange={(e) => setFormData({ displayName: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="camera">Camera</Label>
                <p className="text-sm text-muted-foreground">Enable your camera when joining</p>
              </div>
              <Switch
                id="camera"
                checked={formData.enableCamera}
                onCheckedChange={(checked) => setFormData({ enableCamera: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="microphone">Microphone</Label>
                <p className="text-sm text-muted-foreground">Enable your microphone when joining</p>
              </div>
              <Switch
                id="microphone"
                checked={formData.enableMicrophone}
                onCheckedChange={(checked) => setFormData({ enableMicrophone: checked })}
              />
            </div>

            {isAuthenticated && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="share">Share on Olympus Social</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this room visible on Olympus Social for others to join
                  </p>
                </div>
                <Switch
                  id="share"
                  checked={formData.shareOnSocial}
                  onCheckedChange={(checked) => setFormData({ shareOnSocial: checked })}
                />
              </div>
            )}
          </div>

          <Button className="w-full" size="lg" onClick={handleJoin}>
            Join Room
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

