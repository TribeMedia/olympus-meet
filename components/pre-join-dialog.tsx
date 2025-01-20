"use client"

import { useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { usePreJoinStore } from "@/store/use-pre-join-store"
import { useAuthStore } from "@/store/use-auth-store"
import { toast } from "sonner"

interface PreJoinDialogProps {
  roomName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onJoin: (token: string) => void
}

export function PreJoinDialog({ roomName, open, onOpenChange, onJoin }: PreJoinDialogProps) {
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

      const encodedRoom = encodeURIComponent(roomName)
      const encodedUsername = encodeURIComponent(formData.displayName)
      
      const response = await fetch(`/api/livekit-token?roomName=${encodedRoom}&participantName=${encodedUsername}`)
      const data = await response.json()

      if (!response.ok) {
        console.error('Token generation failed:', data)
        throw new Error(data instanceof Error ? data.message : "Failed to join room")
      }

      if (!data.participantToken || !data.serverUrl) {
        console.error('Invalid connection details received:', data)
        throw new Error("Invalid connection details received")
      }

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

      onJoin(data.participantToken)
      onOpenChange(false)
    } catch (error) {
      console.error('Join room error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to join room")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Meeting</DialogTitle>
          <DialogDescription>Enter your details to join {roomName}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
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
                  disabled={!isAuthenticated}
                />
              </div>
            )}
          </div>

          <Button onClick={handleJoin} className="w-full">
            Join Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
