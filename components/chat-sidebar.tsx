"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { X, Users, Send } from "lucide-react"
import type { Room, RemoteParticipant, DataPacket_Kind } from "livekit-client"
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

    const handleData = (payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind, topic?: string) => {
      try {
        if (payload) {
          const decoder = new TextDecoder()
          const data = JSON.parse(decoder.decode(payload))
          if (data.type === "chat") {
            const message: ChatMessage = {
              id: `${Date.now()}-${Math.random()}`,
              message: data.message,
              from: {
                identity: participant?.identity || room.localParticipant.identity,
                name: participant?.name || room.localParticipant.name,
              },
              timestamp: Date.now(),
              isSelf: !participant,
              roomName: room.name,
              status: 'sent'
            }
            addMessage(message)
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

    sendMessage(inputValue.trim())
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
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent 
        side="right" 
        className="w-[400px] p-0 flex flex-col [&_button[aria-label='Close']]:hidden"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-lg font-semibold">Chat</SheetTitle>
              {selectedParticipant && (
                <Badge variant="secondary" className="ml-2">
                  Private: {selectedParticipant.identity}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-1 h-[calc(100vh-8rem)]">
          <div className="w-16 border-r bg-muted/50 p-2 flex flex-col items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full",
                    !selectedParticipant && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setSelectedParticipant(null)}
                  aria-label="Message everyone"
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
                      selectedParticipant?.identity === participant.identity && 
                      "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      if ('signalClient' in participant) {  
                        setSelectedParticipant(participant as RemoteParticipant)
                      }
                    }}
                    style={{
                      backgroundColor: getParticipantColor(participant.identity),
                    }}
                    aria-label={`Message ${participant.identity}`}
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

          <div className="flex-1 flex flex-col">
            <ScrollArea 
              className="flex-1 px-6 py-4" 
              ref={scrollAreaRef}
            >
              <div className="space-y-4">
                {messages[room.name]?.map((message) => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex gap-3",
                      message.isSelf ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar
                      className="h-8 w-8"
                      style={{
                        backgroundColor: getParticipantColor(message.from.identity),
                      }}
                    >
                      <AvatarFallback>
                        {getParticipantInitials(message.from.identity)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 max-w-[75%]",
                        message.isSelf 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">
                          {message.from.name}
                        </p>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    selectedParticipant 
                      ? `Message ${selectedParticipant.identity}...` 
                      : "Message everyone..."
                  }
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
