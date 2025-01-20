"use client"

import { useEffect, useState } from 'react'
import {
  LiveKitRoom,
  VideoConference as LiveKitVideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react'
import { Track } from 'livekit-client'

interface VideoConferenceProps {
  token: string
  roomName: string
}

export function VideoConference({ token, roomName }: VideoConferenceProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [serverUrl, setServerUrl] = useState<string>('')

  useEffect(() => {
    setIsMounted(true)
    // Get the server URL from environment variable
    const url = process.env.NEXT_PUBLIC_LIVEKIT_URL
    if (!url) {
      console.error('NEXT_PUBLIC_LIVEKIT_URL is not set')
      return
    }
    setServerUrl(url)
  }, [])

  if (!isMounted || !serverUrl) {
    return null
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={true}
      audio={true}
    >
      <div className="h-screen bg-background">
        <LiveKitVideoConference />
      </div>
    </LiveKitRoom>
  )
}
