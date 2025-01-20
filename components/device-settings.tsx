"use client"

import React, { useState, useEffect } from "react"
import { useLocalParticipant, useMediaDevices } from "@livekit/components-react"
import { LocalParticipant, LocalTrackPublication, Track } from "livekit-client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DeviceSettings() {
  const { localParticipant } = useLocalParticipant({
    room: undefined
  })
  const devices = useMediaDevices({
    kind: 'videoinput',
  })

  const videoInputDevices = devices.filter(d => d.kind === 'videoinput')
  const audioInputDevices = devices.filter(d => d.kind === 'audioinput')
  const audioOutputDevices = devices.filter(d => d.kind === 'audiooutput')

  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("")
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("")
  const [isTestingAudio, setIsTestingAudio] = useState(false)

  useEffect(() => {
    if (localParticipant) {
      const cameraTrack = localParticipant.getTrackPublication(Track.Source.Camera)
      const microphoneTrack = localParticipant.getTrackPublication(Track.Source.Microphone)

      if (cameraTrack?.track) setSelectedCamera(cameraTrack.track.mediaStreamTrack.getSettings().deviceId || "")
      if (microphoneTrack?.track) setSelectedMicrophone(microphoneTrack.track.mediaStreamTrack.getSettings().deviceId || "")
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

  const handleSpeakerChange = async (deviceId: string) => {
    if ('setSinkId' in HTMLAudioElement.prototype) {
      await (document.querySelector('audio') as HTMLAudioElement)?.setSinkId?.(deviceId)
      setSelectedSpeaker(deviceId)
    }
  }

  const testAudio = () => {
    setIsTestingAudio(true)
    const audio = new Audio("/test-audio.mp3")
    if ('setSinkId' in audio) {
      void audio.setSinkId(selectedSpeaker)
    }
    void audio.play()
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
                        const pub = localParticipant?.getTrackPublication(Track.Source.Camera)
                        el.srcObject = pub?.track ? new MediaStream([pub.track.mediaStreamTrack]) : null
                        void el.play()
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

