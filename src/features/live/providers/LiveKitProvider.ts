import { 
  Room, 
  RoomEvent, 
  Track, 
  VideoPresets,
  ConnectionQuality,
  RemoteParticipant,
  LocalTrackPublication
} from 'livekit-client';
import { 
  LiveMediaProvider, 
  PublishOptions, 
  ConnectionQualityStatus 
} from './LiveMediaProvider';

export class LiveKitProvider implements LiveMediaProvider {
  private room: Room | null = null;
  private localStream: MediaStream | null = null;
  private serverUrl: string;
  private currentFacingMode: 'user' | 'environment' = 'user';
  private lastPublishOptions: PublishOptions | null = null;

  private participantJoinedCallbacks: ((id: string, name?: string) => void)[] = [];
  private participantLeftCallbacks: ((id: string) => void)[] = [];
  private trackSubscribedCallbacks: ((track: MediaStreamTrack, id: string) => void)[] = [];
  private trackUnsubscribedCallbacks: ((id: string) => void)[] = [];
  private connectionQualityCallbacks: ((q: ConnectionQualityStatus) => void)[] = [];
  private errorCallbacks: ((err: Error) => void)[] = [];

  constructor(serverUrl?: string) {
    this.serverUrl = serverUrl || (import.meta as any).env?.VITE_LIVEKIT_URL || '';
  }

  setServerUrl(url: string) {
    if (url) this.serverUrl = url;
  }

  async connect(roomName: string, token: string, _identity: string, serverUrl?: string): Promise<void> {
    const targetUrl = serverUrl || this.serverUrl;
    if (targetUrl) {
      this.serverUrl = targetUrl;
    }

    if (!this.serverUrl || !token) {
      throw new Error('LiveKit server URL or token missing');
    }

    try {
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution
        }
      });

      this.setupListeners();
      await this.room.connect(this.serverUrl, token);

      // If we had local preview tracks before connecting, publish to room now
      if (this.lastPublishOptions) {
        await this.publishToRoom(this.lastPublishOptions);
      }

      // Check already existing participants' tracks
      this.room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((pub) => {
          if (pub.track) {
            if (pub.track.kind === Track.Kind.Audio) {
              pub.track.attach();
            }
            if (pub.track.mediaStreamTrack) {
              this.trackSubscribedCallbacks.forEach(cb => cb(pub.track!.mediaStreamTrack, participant.identity));
            }
          }
        });
      });
    } catch (err: any) {
      console.error('LiveKit connection error:', err);
      this.errorCallbacks.forEach(cb => cb(err));
      throw err;
    }
  }

  private setupListeners() {
    if (!this.room) return;

    this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      this.participantJoinedCallbacks.forEach(cb => cb(participant.identity, participant.name));
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      this.participantLeftCallbacks.forEach(cb => cb(participant.identity));
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      if (track.kind === Track.Kind.Audio) {
        track.attach();
      }
      if (track.mediaStreamTrack) {
        this.trackSubscribedCallbacks.forEach(cb => cb(track.mediaStreamTrack, participant.identity));
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (_track, _pub, participant) => {
      this.trackUnsubscribedCallbacks.forEach(cb => cb(participant.identity));
    });

    this.room.on(RoomEvent.ConnectionQualityChanged, (quality: ConnectionQuality) => {
      let status: ConnectionQualityStatus = 'good';
      if (quality === ConnectionQuality.Excellent) status = 'excellent';
      else if (quality === ConnectionQuality.Good) status = 'good';
      else if (quality === ConnectionQuality.Poor) status = 'poor';
      else if (quality === ConnectionQuality.Lost) status = 'lost';
      this.connectionQualityCallbacks.forEach(cb => cb(status));
    });

    this.room.on(RoomEvent.Disconnected, () => {
      this.connectionQualityCallbacks.forEach(cb => cb('lost'));
    });
  }

  async publish(options: PublishOptions): Promise<MediaStreamTrack[]> {
    this.lastPublishOptions = options;
    this.currentFacingMode = options.facingMode || 'user';

    // If room is connected, publish via LiveKit
    if (this.room) {
      return this.publishToRoom(options);
    }

    // If room is not yet connected (e.g. pre-live camera preview), obtain local preview stream
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: options.video ? { facingMode: this.currentFacingMode } : false,
          audio: options.audio
        });
        this.localStream = stream;
        return stream.getTracks();
      }
    } catch (err) {
      console.warn('Pre-connect camera preview error:', err);
    }

    return [];
  }

  private async publishToRoom(options: PublishOptions): Promise<MediaStreamTrack[]> {
    if (!this.room) return [];
    const tracks: MediaStreamTrack[] = [];

    if (options.video) {
      const pub: LocalTrackPublication = await this.room.localParticipant.setCameraEnabled(
        true,
        {
          facingMode: this.currentFacingMode,
          resolution: options.resolution === '1080p' ? VideoPresets.h1080.resolution : VideoPresets.h720.resolution,
        },
        {
          simulcast: true
        }
      ) as any;
      if (pub?.track?.mediaStreamTrack) {
        tracks.push(pub.track.mediaStreamTrack);
      }
    }

    if (options.audio) {
      const audioPub = await this.room.localParticipant.setMicrophoneEnabled(true, {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }) as any;
      if (audioPub?.track?.mediaStreamTrack) {
        tracks.push(audioPub.track.mediaStreamTrack);
      }
    }

    if (tracks.length > 0) {
      this.localStream = new MediaStream(tracks);
    }
    return tracks;
  }

  async unpublish(): Promise<void> {
    if (this.room) {
      await this.room.localParticipant.setCameraEnabled(false);
      await this.room.localParticipant.setMicrophoneEnabled(false);
    }
    this.localStream = null;
  }

  async toggleAudio(enabled: boolean): Promise<boolean> {
    if (this.room) {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
    }
    return enabled;
  }

  async toggleVideo(enabled: boolean): Promise<boolean> {
    if (this.room) {
      await this.room.localParticipant.setCameraEnabled(enabled);
    }
    return enabled;
  }

  async flipCamera(): Promise<void> {
    this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
    if (this.room) {
      await this.room.localParticipant.setCameraEnabled(true, {
        facingMode: this.currentFacingMode
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
    this.localStream = null;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  onParticipantJoined(callback: (id: string, name?: string) => void): void {
    this.participantJoinedCallbacks.push(callback);
  }

  onParticipantLeft(callback: (id: string) => void): void {
    this.participantLeftCallbacks.push(callback);
  }

  onTrackSubscribed(callback: (track: MediaStreamTrack, id: string) => void): void {
    this.trackSubscribedCallbacks.push(callback);
  }

  onTrackUnsubscribed(callback: (id: string) => void): void {
    this.trackUnsubscribedCallbacks.push(callback);
  }

  onConnectionQuality(callback: (q: ConnectionQualityStatus) => void): void {
    this.connectionQualityCallbacks.push(callback);
  }

  onError(callback: (err: Error) => void): void {
    this.errorCallbacks.push(callback);
  }
}
