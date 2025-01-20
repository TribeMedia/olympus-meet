"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { X, Users } from "lucide-react"
import type { Room, RemoteParticipant } from "livekit-client"
import { useParticipants, useLocalParticipant } from "@livekit/components-react"
import { cn } from "@/lib/utils"
import { useChatStore, type ChatMessage } from "@/store/use-chat-store"

interface ChatSidebarProps {
  room: Room
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatSidebar({ room, open, onOpenChange }: ChatSidebarProps) {
  const [inputValue, setInputValue] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  const [selectedParticipant, setSelectedParticipant] = useState<RemoteParticipant | null>(null)
  const { messages, addMessage, setRoom, sendMessage } = useChatStore()

  useEffect(() => {
    setRoom(room)

    const handleData = (payload: Uint8Array, participant = room.localParticipant) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload))
        if (data.type === "chat") {
          if (!data.recipient || data.recipient === localParticipant.identity) {
            const message: ChatMessage = {
              id: `${Date.now()}-${Math.random()}`,
              sender: participant.identity,
              text: data.message,
              timestamp: Date.now(),
              isLocal: participant === room.localParticipant,
              isPrivate: !!data.recipient,
              recipient: data.recipient,
            }
            addMessage(room.name, message)
          }
        }
      } catch (error) {
        console.error("Failed to parse chat message:", error)
      }
    }

    room.on("dataReceived", handleData)

    return () => {
      room.off("dataReceived", handleData)
    }
  }, [room, localParticipant, addMessage, setRoom])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    sendMessage(room.name, inputValue.trim(), selectedParticipant?.identity)
    setInputValue("")
  }

  const getParticipantInitials = (identity: string) => {
    return identity.slice(0, 2).toUpperCase()
  }

  const getParticipantColor = (identity: string) => {
    let hash = 0
    for (let i = 0; i < identity.length; i++) {
      hash = identity.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = hash % 360
    return `hsl(${hue}, 70%, 50%)`
  }

  return (
    <Sidebar variant="floating" side="right" open={open}>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Chat</h2>
            {selectedParticipant && (
              <Badge variant="secondary" className="ml-2">
                Private: {selectedParticipant.identity}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Participants List */}
        <div className="w-16 border-r bg-muted/50 p-2 flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full", !selectedParticipant && "bg-primary text-primary-foreground")}
                onClick={() => setSelectedParticipant(null)}
              >
                <Users className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Everyone</TooltipContent>
          </Tooltip>
          <Separator className="my-2" />
          {participants.map((participant) => (
            <Tooltip key={participant.identity}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full relative",
                    selectedParticipant?.identity === participant.identity && "bg-primary text-primary-foreground",
                  )}
                  onClick={() => setSelectedParticipant(participant)}
                  style={{
                    backgroundColor: getParticipantColor(participant.identity),
                  }}
                >
                  {getParticipantInitials(participant.identity)}
                  {participant.isSpeaking && (
                    <span className="absolute -right-1 -top-1 h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500" />
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {participant.identity}
                {participant.isSpeaking && " (Speaking)"}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages[room.name]?.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.isLocal ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar
                    className="h-8 w-8"
                    style={{
                      backgroundColor: getParticipantColor(message.sender),
                    }}
                  >
                    <AvatarFallback>{getParticipantInitials(message.sender)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[75%]",
                      message.isLocal ? "bg-primary text-primary-foreground" : "bg-muted",
                      message.isPrivate && "border-2 border-primary/50",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{message.sender}</p>
                      {message.isPrivate && (
                        <Badge variant="outline" className="text-xs">
                          Private
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <SidebarFooter className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={selectedParticipant ? `Message ${selectedParticipant.identity}...` : "Message everyone..."}
                className="flex-1"
              />
              <Button type="submit">Send</Button>
            </form>
          </SidebarFooter>
        </div>
      </div>
    </Sidebar>
  )
}

