"use client"

import { useState, useEffect } from "react"
import { VideoConference } from "@/components/video-conference/video-conference"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import ErrorBoundary from "@/components/error-boundary"

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomName = params.roomName as string
  const token = searchParams.get('token')

  // Redirect to home if no token is present
  useEffect(() => {
    if (!token) {
      router.replace('/')
    }
  }, [token, router])

  if (!token) {
    return null
  }

  return (
    <ErrorBoundary
      fallback={<div>Something went wrong in the video conference. Please try refreshing the page.</div>}
    >
      <VideoConference token={token} roomName={roomName} />
    </ErrorBoundary>
  )
}