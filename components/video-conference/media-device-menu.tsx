import * as React from 'react';
import { SetMediaDeviceOptions } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export interface MediaDeviceMenuProps {
  audioInputDevices: SetMediaDeviceOptions[];
  audioOutputDevices: SetMediaDeviceOptions[];
  videoDevices: SetMediaDeviceOptions[];
  currentAudioInput: string;
  currentAudioOutput: string;
  currentVideo: string;
  onAudioInputChange: (deviceId: string) => void;
  onAudioOutputChange: (deviceId: string) => void;
  onVideoChange: (deviceId: string) => void;
  audioLevel: number;
  onAudioLevelChange: (level: number) => void;
  videoQuality: 'low' | 'medium' | 'high';
  onVideoQualityChange: React.Dispatch<React.SetStateAction<'low' | 'medium' | 'high'>>;
}

export const MediaDeviceMenu: React.FC<MediaDeviceMenuProps> = ({
  audioInputDevices,
  audioOutputDevices,
  videoDevices,
  currentAudioInput,
  currentAudioOutput,
  currentVideo,
  onAudioInputChange,
  onAudioOutputChange,
  onVideoChange,
  audioLevel,
  onAudioLevelChange,
  videoQuality,
  onVideoQualityChange
}: MediaDeviceMenuProps) => {
  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* Audio Input Devices */}
        <div>
          <Label htmlFor="microphone">Microphone</Label>
          <Select value={currentAudioInput} onValueChange={onAudioInputChange}>
            <SelectTrigger id="microphone" className="w-full">
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent>
              {audioInputDevices.map((device: SetMediaDeviceOptions) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audio Output Devices */}
        <div>
          <Label htmlFor="speaker">Speaker</Label>
          <Select value={currentAudioOutput} onValueChange={onAudioOutputChange}>
            <SelectTrigger id="speaker" className="w-full">
              <SelectValue placeholder="Select speaker" />
            </SelectTrigger>
            <SelectContent>
              {audioOutputDevices.map((device: SetMediaDeviceOptions) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Video Devices */}
        <div>
          <Label htmlFor="camera">Camera</Label>
          <Select value={currentVideo} onValueChange={onVideoChange}>
            <SelectTrigger id="camera" className="w-full">
              <SelectValue placeholder="Select camera" />
            </SelectTrigger>
            <SelectContent>
              {videoDevices.map((device: SetMediaDeviceOptions) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Video Quality */}
        <div>
          <Label htmlFor="quality">Video Quality</Label>
          <Select 
            value={videoQuality} 
            onValueChange={(value: 'low' | 'medium' | 'high') => onVideoQualityChange(value)}
          >
            <SelectTrigger id="quality" className="w-full">
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audio Level Meter */}
        <div>
          <Label htmlFor="audio-level">Audio Level</Label>
          <div className="mt-1 h-2 w-full bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-200"
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
