"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface WebRTCMeterProps {
  peerConnection?: RTCPeerConnection
}

export function WebRTCMeter({ peerConnection }: WebRTCMeterProps) {
  const [stats, setStats] = useState({
    bitrate: 0,
    packetLoss: 0,
    rtt: 0,
  })

  useEffect(() => {
    if (!peerConnection) return

    let lastBytesSent = 0
    let lastTimestamp = 0

    const interval = setInterval(async () => {
      try {
        const stats = await peerConnection.getStats()
        let bytesSent = 0
        let timestamp = 0
        let packetLoss = 0
        let rtt = 0

        stats.forEach((report) => {
          if (report.type === "outbound-rtp" && report.kind === "video") {
            bytesSent = report.bytesSent
            timestamp = report.timestamp
          }
          if (report.type === "remote-inbound-rtp" && report.kind === "video") {
            packetLoss = report.packetsLost
            rtt = report.roundTripTime
          }
        })

        if (lastBytesSent > 0) {
          const bitrate = (8 * (bytesSent - lastBytesSent)) / ((timestamp - lastTimestamp) / 1000)
          setStats({
            bitrate: Math.round(bitrate / 1024), // Convert to Kbps
            packetLoss,
            rtt: Math.round(rtt * 1000), // Convert to ms
          })
        }

        lastBytesSent = bytesSent
        lastTimestamp = timestamp
      } catch (error) {
        console.error("Failed to get WebRTC stats:", error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [peerConnection])

  const getConnectionQuality = () => {
    if (stats.bitrate === 0) return "poor"
    if (stats.bitrate > 1000 && stats.packetLoss < 1 && stats.rtt < 100) return "excellent"
    if (stats.bitrate > 500 && stats.packetLoss < 2 && stats.rtt < 200) return "good"
    return "fair"
  }

  const quality = getConnectionQuality()

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5",
        quality === "excellent" && "border-green-500 text-green-500",
        quality === "good" && "border-blue-500 text-blue-500",
        quality === "fair" && "border-yellow-500 text-yellow-500",
        quality === "poor" && "border-red-500 text-red-500",
      )}
    >
      {quality === "poor" ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
      <span className="hidden sm:inline">{quality}</span>
    </Badge>
  )
}

