'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useChatStore } from '@/store/use-chat-store';
import { Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ControlBarProps {
  roomName: string;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenShareEnabled: boolean;
  isSettingsOpen: boolean;
  onToggleCamera: () => Promise<void>;
  onToggleMicrophone: () => Promise<void>;
  onToggleScreenShare: () => Promise<void>;
  onToggleSettings: () => void;
  onLeave: () => void;
}

export function ControlBar({
  roomName,
  isCameraEnabled,
  isMicrophoneEnabled,
  isScreenShareEnabled,
  isSettingsOpen,
  onToggleCamera,
  onToggleMicrophone,
  onToggleScreenShare,
  onToggleSettings,
  onLeave,
}: ControlBarProps) {
  const { toast } = useToast();
  const { isOpen: isChatOpen, toggleChat } = useChatStore();

  const handleAction = async (action: () => Promise<void>, errorMessage: string) => {
    try {
      await action();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border bg-background/95 p-2.5 shadow-lg backdrop-blur-sm dark:bg-zinc-900/90">
      <div className="flex items-center gap-2">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full transition-colors",
                  isCameraEnabled 
                    ? "bg-primary/20 hover:bg-primary/30" 
                    : "bg-destructive/20 hover:bg-destructive/30"
                )}
                onClick={() => handleAction(onToggleCamera, "Failed to toggle camera")}
              >
                {isCameraEnabled ? (
                  <Video className="h-5 w-5 text-foreground" />
                ) : (
                  <VideoOff className="h-5 w-5 text-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>{isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full transition-colors",
                  isMicrophoneEnabled 
                    ? "bg-primary/20 hover:bg-primary/30" 
                    : "bg-destructive/20 hover:bg-destructive/30"
                )}
                onClick={() => handleAction(onToggleMicrophone, "Failed to toggle microphone")}
              >
                {isMicrophoneEnabled ? (
                  <Mic className="h-5 w-5 text-foreground" />
                ) : (
                  <MicOff className="h-5 w-5 text-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>{isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full transition-colors",
                  isScreenShareEnabled 
                    ? "bg-primary/20 hover:bg-primary/30" 
                    : "bg-zinc-500/20 hover:bg-zinc-500/30"
                )}
                onClick={() => handleAction(onToggleScreenShare, "Failed to toggle screen share")}
              >
                <MonitorUp className={cn("h-5 w-5", isScreenShareEnabled ? "text-foreground" : "text-foreground")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>{isScreenShareEnabled ? 'Stop sharing' : 'Share screen'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full transition-colors",
                  isChatOpen 
                    ? "bg-primary/20 hover:bg-primary/30" 
                    : "bg-zinc-500/20 hover:bg-zinc-500/30"
                )}
                onClick={toggleChat}
              >
                <MessageSquare className={cn("h-5 w-5", "text-foreground")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>{isChatOpen ? 'Close chat' : 'Open chat'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full transition-colors",
                  isSettingsOpen
                    ? "bg-primary/20 hover:bg-primary/30"
                    : "bg-zinc-500/20 hover:bg-zinc-500/30"
                )}
                onClick={onToggleSettings}
              >
                <Settings className={cn("h-5 w-5", "text-foreground")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-2 h-8" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-destructive/20 hover:bg-destructive/30"
                onClick={onLeave}
              >
                <LogOut className="h-5 w-5 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>Leave room</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
