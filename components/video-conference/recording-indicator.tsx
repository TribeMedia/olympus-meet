'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Record, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RecordingIndicatorProps {
  isRecording: boolean;
  duration?: number;
  onToggleRecording?: () => void;
  className?: string;
  showDuration?: boolean;
  canControl?: boolean;
}

export function RecordingIndicator({
  isRecording,
  duration = 0,
  onToggleRecording,
  className,
  showDuration = true,
  canControl = false,
}: RecordingIndicatorProps) {
  const [elapsedTime, setElapsedTime] = useState(duration);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime((prev: number) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const pad = (num: number): string => num.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    }
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  };

  const indicator = (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        isRecording ? 'bg-red-100 dark:bg-red-950' : 'bg-transparent',
        className
      )}
    >
      {isRecording ? (
        <>
          <Record className="h-4 w-4 text-red-500 animate-pulse" />
          {showDuration && (
            <span className="text-sm font-medium text-red-500">
              {formatTime(elapsedTime)}
            </span>
          )}
        </>
      ) : canControl ? (
        <Record className="h-4 w-4 text-muted-foreground" />
      ) : null}
    </div>
  );

  if (!canControl) {
    return indicator;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-2',
            isRecording && 'text-red-500 hover:text-red-600'
          )}
          onClick={onToggleRecording}
        >
          {isRecording ? (
            <>
              <StopCircle className="h-4 w-4" />
              Stop Recording
            </>
          ) : (
            <>
              <Record className="h-4 w-4" />
              Start Recording
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </TooltipContent>
    </Tooltip>
  );
}
