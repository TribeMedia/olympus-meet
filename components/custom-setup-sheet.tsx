import { Settings } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface CustomSetupSheetProps {
  roomName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (settings: CustomSetupSettings) => void
  onConnect: (settings: CustomSetupSettings) => void
}

export interface CustomSetupSettings {
  pdsServerUrl: string
  livekitServerUrl: string
  token?: string
  enableE2EE: boolean
}

export function CustomSetupSheet({ roomName, open, onOpenChange, onSave, onConnect }: CustomSetupSheetProps) {
  const [settings, setSettings] = useState<CustomSetupSettings>({
    pdsServerUrl: "https://bsky.social",
    livekitServerUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://livekit.prometheus-platform.io",
    token: "",
    enableE2EE: false,
  })

  const handleSave = () => {
    onSave(settings)
  }

  const handleConnect = () => {
    onConnect(settings)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Custom Setup</SheetTitle>
          <SheetDescription>
            Connect Olympus Meet to your preferred LiveKit server while authenticating through your chosen AT Protocol
            PDS server.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input id="roomName" value={roomName} className="bg-muted" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pdsServerUrl">PDS Server URL</Label>
            <Input
              id="pdsServerUrl"
              value={settings.pdsServerUrl}
              onChange={(e) => setSettings({ ...settings, pdsServerUrl: e.target.value })}
              placeholder="https://bsky.social"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="livekitServerUrl">LiveKit Server URL</Label>
            <Input
              id="livekitServerUrl"
              value={settings.livekitServerUrl}
              onChange={(e) => setSettings({ ...settings, livekitServerUrl: e.target.value })}
              placeholder="wss://livekit.prometheus-platform.io"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Input
              id="token"
              value={settings.token}
              onChange={(e) => setSettings({ ...settings, token: e.target.value })}
              placeholder="Optional LiveKit token"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="e2ee"
              checked={settings.enableE2EE}
              onCheckedChange={(checked) => setSettings({ ...settings, enableE2EE: checked })}
            />
            <Label htmlFor="e2ee">Enable end-to-end encryption</Label>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Button variant="default" onClick={handleSave}>
              Save Settings
            </Button>
            <Button variant="secondary" onClick={handleConnect}>
              Connect
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function CustomSetupTrigger() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
    >
      <Settings className="h-4 w-4" />
      <span className="sr-only">Custom Setup</span>
    </Button>
  )
}

