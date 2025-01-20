"use client"

import { useEffect, useState, useCallback } from "react"
import {
  LiveKitRoom,
  VideoConference as LiveKitVideoConference,
  ControlBar,
  RoomAudioRenderer,
  useLiveKitRoom,
  GridLayout,
  ParticipantTile,
  useLocalParticipant,
  useParticipants,
} from "@livekit/components-react"
import { useRoomStore } from "@/store/use-room-store"
import { KrispNoiseFilter } from "@livekit/krisp-noise-filter"
import { useAuthStore } from "@/store/use-auth-store"
import { Button } from "@/components/ui/button"
import { Track, RoomEvent, Participant, type Room, type RemoteParticipant } from "livekit-client"
import { WebRTCMeter } from "@/components/webrtc-meter"
import { ChatSidebar } from "@/components/chat-sidebar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, MessageCircleOff, RepeatIcon as Record, Settings, Share, Share2, MonitorUp } from "lucide-react"
import { toast } from "sonner"
import ErrorBoundary from "@/components/error-boundary"
import { DeviceSettings } from "@/components/device-settings"
import { useChatStore } from "@/store/use-chat-store"

interface VideoConferenceProps {
  token: string
  roomName: string
}

export function VideoConference({ token, roomName }: VideoConferenceProps) {
  const [noiseFilter, setNoiseFilter] = useState<KrispNoiseFilter | null>(null)
  const { setRoom } = useRoomStore()
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    const initNoiseFilter = async () => {
      try {
        const filter = new KrispNoiseFilter()
        await filter.init()
        setNoiseFilter(filter)
        console.log("Noise filter initialized successfully")
      } catch (error) {
        console.error("Failed to initialize noise filter:", error)
        toast.error("Failed to initialize noise filter")
      }
    }
    initNoiseFilter()
  }, [])

  const handleRoomConnected = useCallback(
    (room: Room) => {
      console.log("Connected to room:", room.name)
      setRoom(room)
      toast.success(`Connected to room: ${room.name}`)
    },
    [setRoom],
  )

  const handleError = useCallback((error: Error) => {
    console.error("Room connection error:", error)
    toast.error(`Room connection error: ${error.message}`)
  }, [])

  return (
    <ErrorBoundary fallback={<div>Something went wrong in the video conference. Please try refreshing the page.</div>}>
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        audio={true}
        video={true}
        onConnected={handleRoomConnected}
        onError={handleError}
        data-lk-theme="default"
        className="h-screen bg-black"
      >
        <div className="h-full dark">
          <VideoConferenceContent
            noiseFilter={noiseFilter}
            roomName={roomName}
            isChatOpen={isChatOpen}
            onChatOpenChange={setIsChatOpen}
          />
        </div>
      </LiveKitRoom>
    </ErrorBoundary>
  )
}

interface VideoConferenceContentProps {
  noiseFilter: KrispNoiseFilter | null
  roomName: string
  isChatOpen: boolean
  onChatOpenChange: (open: boolean) => void
}

function VideoConferenceContent({ noiseFilter, roomName, isChatOpen, onChatOpenChange }: VideoConferenceContentProps) {
  const room = useLiveKitRoom()
  const [isRecording, setIsRecording] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const agent = useAuthStore((state) => state.agent)
  const session = useAuthStore((state) => state.session)
  const { localParticipant } = useLocalParticipant()
  const participants = useParticipants()
  const { setRoom: setChatRoom } = useChatStore()

  useEffect(() => {
    if (room && noiseFilter) {
      try {
        room.startAudio(
          noiseFilter.createAudioSourceNode(room.localParticipant.getTrackPublication("microphone")?.track),
        )
        console.log("Audio started with noise filter")
      } catch (error) {
        console.error("Failed to start audio with noise filter:", error)
        toast.error("Failed to start audio with noise filter")
      }
    }
  }, [room, noiseFilter])

  useEffect(() => {
    if (room) {
      const handleParticipantConnected = (participant: RemoteParticipant) => {
        console.log("Participant connected:", participant.identity)
        toast.info(`${participant.identity} joined the room`)
      }

      const handleParticipantDisconnected = (participant: RemoteParticipant) => {
        console.log("Participant disconnected:", participant.identity)
        toast.info(`${participant.identity} left the room`)
      }

      room.on(RoomEvent.ParticipantConnected, handleParticipantConnected)
      room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)

      return () => {
        room.off(RoomEvent.ParticipantConnected, handleParticipantConnected)
        room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
      }
    }
  }, [room])

  const startRecording = () => {
    if (!room) return

    const audioTrack = room.localParticipant.getTrack(Track.Source.Microphone)?.track
    const videoTrack = room.localParticipant.getTrack(Track.Source.Camera)?.track

    if (!audioTrack || !videoTrack) {
      console.error("Audio or video track not found")
      toast.error("Audio or video track not found")
      return
    }

    const stream = new MediaStream([audioTrack, videoTrack])
    const recorder = new MediaRecorder(stream)

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data])
      }
    }

    recorder.start()
    setMediaRecorder(recorder)
    setIsRecording(true)
    console.log("Recording started")
    toast.success("Recording started")
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
      console.log("Recording stopped")
      toast.success("Recording stopped")
    }
  }

  const publishRecording = async () => {
    if (!isAuthenticated || !agent) {
      console.error("User not authenticated or agent not available")
      toast.error("You need to be logged in to publish the recording")
      return
    }

    try {
      const blob = new Blob(recordedChunks, { type: "video/webm" })
      const file = new File([blob], `${roomName}_recording.webm`, { type: "video/webm" })

      console.log("Publishing recording...")
      toast.promise(
        async () => {
          const response = await agent.uploadBlob(file, {
            encoding: "video/webm",
          })

          await agent.post({
            text: `Recording from Olympus Meet room: ${roomName}`,
            embed: {
              $type: "app.bsky.embed.record",
              record: {
                $type: "app.bsky.embed.record",
                uri: response.uri,
                cid: response.cid,
              },
            },
          })
          console.log("Recording published successfully")
        },
        {
          loading: "Publishing recording...",
          success: "Recording published successfully!",
          error: "Failed to publish recording",
        },
      )
    } catch (error) {
      console.error("Error publishing recording:", error)
    }
  }

  const toggleScreenShare = useCallback(async () => {
    if (localParticipant) {
      try {
        if (localParticipant.isScreenShareEnabled) {
          await localParticipant.stopScreenShare()
          console.log("Screen sharing stopped")
          toast.success("Screen sharing stopped")
        } else {
          await localParticipant.setScreenShareEnabled(true)
          console.log("Screen sharing started")
          toast.success("Screen sharing started")
        }
      } catch (error) {
        console.error("Error toggling screen share:", error)
        toast.error("Failed to toggle screen share")
      }
    }
  }, [localParticipant])

  return (
    <div className="relative h-full flex flex-col">
      {/* User Info */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
          {session?.handle || room?.localParticipant.identity}
        </Badge>
        <WebRTCMeter peerConnection={room?.localParticipant.publisherPeerConnection} />
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="destructive" className="animate-pulse">
            <Record className="h-3 w-3 mr-1" />
            Recording
          </Badge>
        </div>
      )}

      {/* Main Content */}
      <ErrorBoundary fallback={<div>Error loading video conference. Please try refreshing.</div>}>
        <LiveKitVideoConference />
      </ErrorBoundary>
      <RoomAudioRenderer />

      {/* Participants Grid */}
      <ErrorBoundary fallback={<div>Error loading participants. Please try refreshing.</div>}>
        <GridLayout
          tracks={participants.filter((p) => p.identity !== localParticipant.identity).flatMap((p) => p.videoTracks)}
        >
          {(track) => <ParticipantTile key={track.sid} participant={track.participant} />}
        </GridLayout>
      </ErrorBoundary>

      {/* Custom Controls */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg">
        <Button
          variant={isRecording ? "destructive" : "ghost"}
          size="icon"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? <Record className="h-4 w-4" /> : <Record className="h-4 w-4" />}
        </Button>
        <Button variant={isChatOpen ? "secondary" : "ghost"} size="icon" onClick={() => onChatOpenChange(!isChatOpen)}>
          {isChatOpen ? <MessageCircleOff className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        </Button>
        {recordedChunks.length > 0 && isAuthenticated && (
          <Button variant="ghost" size="icon" onClick={publishRecording}>
            <Share2 className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={toggleScreenShare}>
          <MonitorUp className="h-4 w-4" />
        </Button>
        <DeviceSettings />
      </div>

      {/* LiveKit Control Bar */}
      <ControlBar />

      {/* Chat Sidebar */}
      <ChatSidebar room={room} open={isChatOpen} onOpenChange={onChatOpenChange} />
    </div>
  )
}

