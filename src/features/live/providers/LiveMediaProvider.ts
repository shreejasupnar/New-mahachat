// Media Provider Interface for Real-Time Video/Audio Streaming
export type ConnectionQualityStatus = 'excellent' | 'good' | 'poor' | 'lost' | 'unknown';

export interface ParticipantMediaTrack {
  participantId: string;
  participantName?: string;
  isHost?: boolean;
  videoTrack?: MediaStreamTrack | null;
  audioTrack?: MediaStreamTrack | null;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

export interface PublishOptions {
  video: boolean;
  audio: boolean;
  facingMode?: 'user' | 'environment';
  resolution?: '720p' | '1080p' | 'auto';
}

export interface LiveMediaProvider {
  connect(roomName: string, token: string, identity: string): Promise<void>;
  publish(options: PublishOptions): Promise<MediaStreamTrack[]>;
  unpublish(): Promise<void>;
  toggleAudio(enabled: boolean): Promise<boolean>;
  toggleVideo(enabled: boolean): Promise<boolean>;
  flipCamera(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Local stream access for immediate preview
  getLocalStream(): MediaStream | null;
  
  // Event listeners
  onParticipantJoined(callback: (participantId: string, name?: string) => void): void;
  onParticipantLeft(callback: (participantId: string) => void): void;
  onTrackSubscribed(callback: (track: MediaStreamTrack, participantId: string) => void): void;
  onTrackUnsubscribed(callback: (participantId: string) => void): void;
  onConnectionQuality(callback: (quality: ConnectionQualityStatus) => void): void;
  onError(callback: (error: Error) => void): void;
}
