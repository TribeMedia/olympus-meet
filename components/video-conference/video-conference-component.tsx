'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Room, RoomOptions, VideoCodec, VideoPresets, DeviceUnsupportedError, RoomConnectOptions, ExternalE2EEKeyProvider } from 'livekit-client';
import { LiveKitRoom } from '@livekit/components-react';
import type { SetMediaDeviceOptions } from './types';
import { MediaDeviceMenu } from './media-device-menu';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { decodePassphrase } from '@/lib/client-utils';
import { useRecordingStore } from '@/store/use-recording-store';
import type { ConnectionDetails } from '@/lib/types';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ControlBar, ControlBarProps } from '../control-bar';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './video-conference-component.module.css';

interface VideoConferenceComponentProps {
  userChoices: {
    username: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    videoDeviceId?: string;
    audioDeviceId?: string;
  };
  connectionDetails: ConnectionDetails;
  options: {
    hq: boolean;
    codec: VideoCodec;
  };
}

interface MediaDeviceMenuProps {
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

const formatChatMessageLinks = (message: string): string => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
};

export function VideoConferenceComponent({ userChoices, connectionDetails, options }: VideoConferenceComponentProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { setRoom: setRecordingRoom } = useRecordingStore();
  
  // State for media controls
  const [isCameraEnabled, setIsCameraEnabled] = React.useState(userChoices.videoEnabled);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = React.useState(userChoices.audioEnabled);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);

  // E2EE setup
  const e2eePassphrase = typeof window !== 'undefined' ? decodePassphrase(location.hash.substring(1)) : null;
  const worker = typeof window !== 'undefined' && e2eePassphrase && new Worker(new URL('livekit-client/e2ee-worker', import.meta.url));
  const e2eeEnabled = !!(e2eePassphrase && worker);
  const keyProvider = new ExternalE2EEKeyProvider();
  const [e2eeSetupComplete, setE2eeSetupComplete] = React.useState(false);

  // Room options
  const roomOptions = React.useMemo((): RoomOptions => {
    let videoCodec: VideoCodec | undefined = options.codec ? options.codec : 'vp9';
    if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
      videoCodec = undefined;
    }
    return {
      videoCaptureDefaults: {
        deviceId: userChoices.videoDeviceId,
        resolution: options.hq ? VideoPresets.h2160 : VideoPresets.h720,
        facingMode: 'user',
      },
      publishDefaults: {
        dtx: false,
        videoSimulcastLayers: options.hq
          ? [VideoPresets.h1080, VideoPresets.h720]
          : [VideoPresets.h540, VideoPresets.h216],
        red: !e2eeEnabled,
        videoCodec,
        stopMicTrackOnMute: true,
        videoEncoding: {
          maxBitrate: 1_500_000,
          maxFramerate: 30,
        },
      },
      audioCaptureDefaults: {
        deviceId: userChoices.audioDeviceId,
        echoCancellation: true,
        noiseSuppression: true,
      },
      adaptiveStream: { pixelDensity: 'screen' },
      dynacast: true,
      e2ee: e2eeEnabled
        ? {
            keyProvider,
            worker,
          }
        : undefined,
    };
  }, [userChoices, options.hq, options.codec, e2eeEnabled]);

  const room = React.useMemo(() => new Room(roomOptions), [roomOptions]);

  // Handle E2EE setup
  React.useEffect(() => {
    const setupE2EE = async () => {
      if (e2eeEnabled) {
        try {
          await keyProvider.setKey(decodePassphrase(e2eePassphrase));
          await room.setE2EEEnabled(true);
        } catch (e) {
          if (e instanceof DeviceUnsupportedError) {
            toast({
              variant: "destructive",
              title: "Browser Not Supported",
              description: "You're trying to join an encrypted meeting, but your browser does not support it. Please update to the latest version and try again.",
            });
            console.error(e);
          } else {
            throw e;
          }
        }
      }
      setE2eeSetupComplete(true);
    };

    setupE2EE();
  }, [e2eeEnabled, e2eePassphrase, keyProvider, room, toast]);

  // Monitor room participant state changes
  React.useEffect(() => {
    const handleParticipantUpdated = () => {
      if (room.localParticipant) {
        setIsCameraEnabled(room.localParticipant.isCameraEnabled);
        setIsMicrophoneEnabled(room.localParticipant.isMicrophoneEnabled);
        setIsScreenShareEnabled(room.localParticipant.isScreenShareEnabled);
      }
    };

    room.on('connected', handleParticipantUpdated);
    room.on('disconnected', () => {});
    room.on('localTrackPublished', handleParticipantUpdated);
    room.on('localTrackUnpublished', handleParticipantUpdated);
    room.localParticipant?.on('trackMuted', handleParticipantUpdated);
    room.localParticipant?.on('trackUnmuted', handleParticipantUpdated);

    return () => {
      room.off('connected', handleParticipantUpdated);
      room.off('disconnected', () => {});
      room.off('localTrackPublished', handleParticipantUpdated);
      room.off('localTrackUnpublished', handleParticipantUpdated);
      room.localParticipant?.off('trackMuted', handleParticipantUpdated);
      room.localParticipant?.off('trackUnmuted', handleParticipantUpdated);
    };
  }, [room]);

  // Handle media toggles
  const toggleCamera = React.useCallback(async () => {
    await room.localParticipant.setCameraEnabled(!isCameraEnabled);
    setIsCameraEnabled(!isCameraEnabled);
  }, [isCameraEnabled, room.localParticipant]);

  const toggleMicrophone = React.useCallback(async () => {
    await room.localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    setIsMicrophoneEnabled(!isMicrophoneEnabled);
  }, [isMicrophoneEnabled, room.localParticipant]);

  const toggleScreenShare = React.useCallback(async () => {
    await room.localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
    setIsScreenShareEnabled(!isScreenShareEnabled);
  }, [isScreenShareEnabled, room.localParticipant]);

  const connectOptions = React.useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  const handleOnLeave = React.useCallback(() => router.push('/'), [router]);
  
  const handleError = React.useCallback((error: Error) => {
    console.error('Room connection error:', error);
    toast({
      variant: "destructive",
      title: "Connection Error",
      description: error instanceof DeviceUnsupportedError 
        ? "Your browser doesn't support the required camera features. Please try a different browser."
        : `Failed to connect: ${error.message}. Please check your camera permissions and try again.`,
    });
  }, [toast]);
  
  const handleEncryptionError = React.useCallback((error: Error) => {
    console.error(error);
    toast({
      variant: "destructive",
      title: "Encryption Error",
      description: `Encountered an encryption error: ${error.message}`,
    });
  }, [toast]);

  React.useEffect(() => {
    setRecordingRoom(room);
    return () => {
      setRecordingRoom(null);
    };
  }, [room, setRecordingRoom]);

  // Wrapper component for SettingsMenu
  const WrappedSettingsMenu = () => {
    // Add your state management for device settings here
    const [audioInputDevices] = React.useState<SetMediaDeviceOptions[]>([]);
    const [audioOutputDevices] = React.useState<SetMediaDeviceOptions[]>([]);
    const [videoDevices] = React.useState<SetMediaDeviceOptions[]>([]);
    const [currentAudioInput, setCurrentAudioInput] = React.useState('');
    const [currentAudioOutput, setCurrentAudioOutput] = React.useState('');
    const [currentVideo, setCurrentVideo] = React.useState('');
    const [audioLevel, setAudioLevel] = React.useState(0);
    const [videoQuality, setVideoQuality] = React.useState<'low' | 'medium' | 'high'>('medium');

    return (
      <MediaDeviceMenu
        audioInputDevices={audioInputDevices}
        audioOutputDevices={audioOutputDevices}
        videoDevices={videoDevices}
        currentAudioInput={currentAudioInput}
        currentAudioOutput={currentAudioOutput}
        currentVideo={currentVideo}
        onAudioInputChange={setCurrentAudioInput}
        onAudioOutputChange={setCurrentAudioOutput}
        onVideoChange={setCurrentVideo}
        audioLevel={audioLevel}
        onAudioLevelChange={setAudioLevel}
        videoQuality={videoQuality}
        onVideoQualityChange={setVideoQuality}
      />
    );
  };

  return (
    <div className={styles.videoContainer}>
      <LiveKitRoom
        connect={e2eeSetupComplete}
        room={room}
        token={connectionDetails.participantToken}
        serverUrl={connectionDetails.serverUrl}
        connectOptions={connectOptions}
        video={isCameraEnabled}
        audio={isMicrophoneEnabled}
        onDisconnected={handleOnLeave}
        onEncryptionError={handleEncryptionError}
        onError={handleError}
        className={styles.fullViewportVideo}
      >
        <div className={styles.controlBar}>
          <ControlBar
            room={room as Room}
            isCameraEnabled={isCameraEnabled}
            isMicrophoneEnabled={isMicrophoneEnabled}
            isScreenShareEnabled={isScreenShareEnabled}
            isSettingsOpen={isSettingsOpen}
            onToggleCamera={toggleCamera}
            onToggleMicrophone={toggleMicrophone}
            onToggleScreenShare={toggleScreenShare}
            onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
            onLeave={handleOnLeave}
          />
        </div>
      </LiveKitRoom>
      <Toaster />
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              className="w-full max-w-md rounded-2xl bg-gradient-to-b from-background/95 to-background/50 p-6 shadow-xl backdrop-blur-sm"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
            >
              <WrappedSettingsMenu />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ChatSidebar />
    </div>
  );
}
