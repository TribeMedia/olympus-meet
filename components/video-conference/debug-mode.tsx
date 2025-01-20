'use client';

import { ConnectionQuality } from 'livekit-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DebugModeProps {
  connectionState: ConnectionQuality;
  isVisible?: boolean;
}

export function DebugMode({ connectionState, isVisible = true }: DebugModeProps) {
  const getConnectionQualityLabel = (quality: ConnectionQuality) => {
    switch (quality) {
      case ConnectionQuality.Excellent:
        return 'Excellent';
      case ConnectionQuality.Good:
        return 'Good';
      case ConnectionQuality.Poor:
        return 'Poor';
      default:
        return 'Unknown';
    }
  };

  const qualityColors: Record<string, string> = {
    excellent: 'bg-green-500',
    good: 'bg-yellow-500',
    poor: 'bg-red-500',
    disconnected: 'bg-gray-500',
  } as const;

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          WebRTC Debug
          <Badge 
            variant="secondary" 
            className={`ml-2 ${qualityColors[getConnectionQualityLabel(connectionState).toLowerCase()]}`}
          >
            {getConnectionQualityLabel(connectionState)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Connection States</h3>
              <div className="text-xs space-y-1">
                <p>Connection: {getConnectionQualityLabel(connectionState)}</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
