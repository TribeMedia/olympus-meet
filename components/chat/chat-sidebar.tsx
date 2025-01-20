'use client';

import * as React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, CheckCircle2, AlertCircle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoomContext } from '@livekit/components-react';
import { useChatStore } from '@/store/use-chat-store';
import { useToast } from "@/components/ui/use-toast";
import { RemoteParticipant, DataPacket_Kind } from 'livekit-client';

export function ChatSidebar() {
  const room = useRoomContext();
  const { toast } = useToast();
  const { 
    isOpen, 
    sendMessage, 
    setRoom,
    getMessagesForRoom,
    closeChat,
    addMessage
  } = useChatStore();
  const [messageInput, setMessageInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messages = React.useMemo(() => getMessagesForRoom(room.name), [room.name, getMessagesForRoom]);

  // Set up room in store
  React.useEffect(() => {
    setRoom(room);
  }, [room.name, setRoom]);

  // Set up room event listeners
  React.useEffect(() => {
    const handleDataReceived = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      kind?: DataPacket_Kind,
      topic?: string
    ) => {
      if (topic === 'chat' && participant?.identity !== room.localParticipant.identity) {
        try {
          const decoder = new TextDecoder();
          const msg = decoder.decode(payload);
          const messageId = `${Date.now()}-${Math.random()}`;
          
          addMessage({
            id: messageId,
            message: msg,
            from: {
              identity: participant?.identity,
              name: participant?.name
            },
            timestamp: Date.now(),
            isSelf: false,
            roomName: room.name,
            status: 'sent'
          });
        } catch (error) {
          console.error('Error processing received message:', error);
        }
      }
    };

    room.on('dataReceived', handleDataReceived);
    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room, addMessage]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = React.useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      try {
        await sendMessage(messageInput);
        setMessageInput('');
        scrollToBottom();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to send message",
          description: "Please check your connection and try again."
        });
      }
    }
  };

  const getStatusIcon = (status: 'sending' | 'sent' | 'error') => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'sent':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-4 z-50 flex h-[calc(100vh-8rem)] w-80 flex-col overflow-hidden rounded-lg border bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h2 className="font-semibold">Chat</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full hover:bg-muted"
          onClick={closeChat}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-1",
                msg.isSelf ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {msg.isSelf ? "You" : msg.from?.name || msg.from?.identity}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-end gap-1">
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    msg.isSelf
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {msg.message}
                </div>
                {msg.isSelf && (
                  <div className="mb-1 flex h-3 w-3">
                    {getStatusIcon(msg.status)}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" variant="ghost">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
