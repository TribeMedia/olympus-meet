"use client"

import React, { useState, useEffect } from "react"
import { useLocalParticipant, useMediaDevices } from "@livekit/components-react"
import { LocalParticipant, LocalTrackPublication, Track } from "livekit-client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DeviceOption {
  label: string
  deviceId: string
}

export function DeviceSettings() {
  const { localParticipant } = useLocalParticipant()
  const { videoInputDevices, audioInputDevices, audioOutputDevices } = useMediaDevices()

  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("")
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("")
  const [isTestingAudio, setIsTestingAudio] = useState(false)

  useEffect(() => {
    if (localParticipant) {
      const cameraTrack = localParticipant.getTrack(Track.Source.Camera)
      const microphoneTrack = localParticipant.getTrack(Track.Source.Microphone)

      if (cameraTrack) setSelectedCamera(cameraTrack.mediaStreamTrack.getSettings().deviceId || "")
      if (microphoneTrack) setSelectedMicrophone(microphoneTrack.mediaStreamTrack.getSettings().deviceId || "")
    }
  }, [localParticipant])

  const handleCameraChange = async (deviceId: string) => {
    if (localParticipant) {
      await localParticipant.setCameraEnabled(false)
      await localParticipant.setCameraEnabled(true, { deviceId })
      setSelectedCamera(deviceId)
    }
  }

  const handleMicrophoneChange = async (deviceId: string) => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(false)
      await localParticipant.setMicrophoneEnabled(true, { deviceId })
      setSelectedMicrophone(deviceId)
    }
  }

  const handleSpeakerChange = (deviceId: string) => {
    if (localParticipant) {
      localParticipant.setAudioOutput(deviceId)
      setSelectedSpeaker(deviceId)
    }
  }

  const testAudio = () => {
    setIsTestingAudio(true)
    const audio = new Audio("/test-audio.mp3")
    audio.setSinkId(selectedSpeaker)
    audio.play()
    audio.onended = () => setIsTestingAudio(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Device Settings</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Device Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="camera">Camera</TabsTrigger>
            <TabsTrigger value="microphone">Microphone</TabsTrigger>
            <TabsTrigger value="speaker">Speaker</TabsTrigger>
          </TabsList>
          <TabsContent value="camera">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="camera">Select Camera</Label>
                <Select value={selectedCamera} onValueChange={handleCameraChange}>
                  <SelectTrigger id="camera">
                    <SelectValue placeholder="Select a camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {videoInputDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCamera && (
                <div className="aspect-video bg-muted">
                  <video
                    ref={(el) => {
                      if (el) {
                        el.srcObject = new MediaStream([
                          localParticipant?.getTrack(Track.Source.Camera)?.mediaStreamTrack as MediaStreamTrack,
                        ])
                        el.play()
                      }
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="microphone">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="microphone">Select Microphone</Label>
                <Select value={selectedMicrophone} onValueChange={handleMicrophoneChange}>
                  <SelectTrigger id="microphone">
                    <SelectValue placeholder="Select a microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioInputDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="speaker">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="speaker">Select Speaker</Label>
                <Select value={selectedSpeaker} onValueChange={handleSpeakerChange}>
                  <SelectTrigger id="speaker">
                    <SelectValue placeholder="Select a speaker" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioOutputDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={testAudio} disabled={isTestingAudio}>
                {isTestingAudio ? "Playing..." : "Test Speaker"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

