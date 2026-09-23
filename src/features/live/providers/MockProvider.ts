import { 
  LiveMediaProvider, 
  PublishOptions, 
  ConnectionQualityStatus 
} from './LiveMediaProvider';

export class MockProvider implements LiveMediaProvider {
  private localStream: MediaStream | null = null;
  private isAudioEnabled = true;
  private isVideoEnabled = true;
  private currentFacingMode: 'user' | 'environment' = 'user';
  private connectedRoom: string | null = null;
  
  private participantJoinedCallbacks: ((id: string, name?: string) => void)[] = [];
  private participantLeftCallbacks: ((id: string) => void)[] = [];
  private trackSubscribedCallbacks: ((track: MediaStreamTrack, id: string) => void)[] = [];
  private trackUnsubscribedCallbacks: ((id: string) => void)[] = [];
  private connectionQualityCallbacks: ((q: ConnectionQualityStatus) => void)[] = [];
  private errorCallbacks: ((err: Error) => void)[] = [];

  async connect(roomName: string, _token: string, _identity: string): Promise<void> {
    this.connectedRoom = roomName;
    setTimeout(() => {
      this.connectionQualityCallbacks.forEach(cb => cb('excellent'));
    }, 500);
  }

  async publish(options: PublishOptions): Promise<MediaStreamTrack[]> {
    try {
      this.currentFacingMode = options.facingMode || 'user';
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: options.video ? { facingMode: this.currentFacingMode } : false,
          audio: options.audio
        });
        this.localStream = stream;
        return stream.getTracks();
      }
    } catch (err) {
      console.warn('Media devices camera/mic not available, creating canvas fallback stream:', err);
    }

    // Fallback animated mock canvas stream if hardware camera is not available in sandbox
    const fallbackStream = this.createFallbackStream();
    this.localStream = fallbackStream;
    return fallbackStream.getTracks();
  }

  private createFallbackStream(): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    let frame = 0;
    const draw = () => {
      if (!ctx) return;
      frame++;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 480);

      // Simulated glowing stream light
      const grad = ctx.createRadialGradient(320, 240, 20, 320, 240, 250);
      grad.addColorStop(0, '#f43f5e');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔴 MAHACHAT LIVE', 320, 220);
      ctx.font = '16px sans-serif';
      ctx.fillText(`Camera Stream Active • ${new Date().toLocaleTimeString()}`, 320, 260);

      requestAnimationFrame(draw);
    };
    draw();

    const stream = canvas.captureStream(30);
    // Simulated silent audio track
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const dst = osc.connect(audioCtx.createMediaStreamDestination());
      osc.start();
      const track = (dst as any).stream.getAudioTracks()[0];
      if (track) stream.addTrack(track);
    } catch {
      // Audio context might be restricted before interaction
    }
    return stream;
  }

  async unpublish(): Promise<void> {
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
  }

  async toggleAudio(enabled: boolean): Promise<boolean> {
    this.isAudioEnabled = enabled;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(t => { t.enabled = enabled; });
    }
    return this.isAudioEnabled;
  }

  async toggleVideo(enabled: boolean): Promise<boolean> {
    this.isVideoEnabled = enabled;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(t => { t.enabled = enabled; });
    }
    return this.isVideoEnabled;
  }

  async flipCamera(): Promise<void> {
    this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
    await this.unpublish();
    await this.publish({
      video: this.isVideoEnabled,
      audio: this.isAudioEnabled,
      facingMode: this.currentFacingMode
    });
  }

  async disconnect(): Promise<void> {
    await this.unpublish();
    this.connectedRoom = null;
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
