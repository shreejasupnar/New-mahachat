import AgoraRTC, {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
  ConnectionState,
  NetworkQuality
} from 'agora-rtc-sdk-ng';
import { getAgoraNumericUid } from '../lib/agoraUtils';

export type AgoraRole = 'publisher' | 'subscriber';
export type AudioQualitySetting = 'low' | 'standard' | 'high';

export interface AgoraVolumeInfo {
  uid: string | number;
  level: number; // 0 to 100
}

export interface AgoraJoinOptions {
  channelName: string;
  uid: string | number;
  role: AgoraRole;
  token?: string | null;
  appId?: string | null;
  audioQuality?: AudioQualitySetting;
}

export interface AgoraTokenResponse {
  success: boolean;
  token: string | null;
  userAccountToken?: string | null;
  appId: string | null;
  channelName: string;
  uid: string | number;
  originalUid?: string | number;
  role: AgoraRole;
  isLive: boolean;
  notice?: string;
  error?: string;
}

class AgoraVoiceService {
  private client: IAgoraRTCClient | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private isPublishing = false;
  private currentChannel: string | null = null;
  private currentUid: string | number | null = null;
  private currentNumericUid: number | null = null;
  private currentRole: AgoraRole = 'subscriber';
  private isMutedLocally = false;
  private isInitialized = false;
  private configuredAppId: string | null = null;
  private isLiveRTC = false;
  private inFlightJoinPromise: Promise<{ success: boolean; isLive: boolean; error?: string }> | null = null;
  private inFlightLeavePromise: Promise<void> | null = null;

  // UID bidirectional mapping between string user IDs and 32-bit Agora numeric integer UIDs
  private uidToNumericMap: Map<string, number> = new Map();
  private numericToUidMap: Map<number, string> = new Map();

  // Event callbacks
  private volumeCallbacks: Set<(volumes: AgoraVolumeInfo[]) => void> = new Set();
  private connectionCallbacks: Set<(state: ConnectionState) => void> = new Set();
  private networkCallbacks: Set<(quality: { uplink: number; downlink: number }) => void> = new Set();
  private remoteUserSpeakingCallbacks: Set<(uid: string | number, speaking: boolean) => void> = new Set();

  /**
   * Request Agora token securely from server-side endpoint
   */
  public async fetchToken(
    channelName: string,
    uid: string | number,
    role: AgoraRole
  ): Promise<AgoraTokenResponse> {
    try {
      const response = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid, role })
      });
      const data = await response.json();
      return data;
    } catch (err: any) {
      console.warn('Failed to fetch Agora token:', err);
      return {
        success: false,
        token: null,
        appId: null,
        channelName,
        uid,
        role,
        isLive: false,
        error: err.message
      };
    }
  }

  /**
   * Check Agora server config
   */
  public async checkConfig(): Promise<{ configured: boolean; appId: string | null }> {
    try {
      const res = await fetch('/api/agora/config');
      const data = await res.json();
      if (data.appId) {
        this.configuredAppId = data.appId;
      }
      return data;
    } catch {
      return { configured: false, appId: null };
    }
  }

  /**
   * Initialize Agora client
   */
  public initialize(appId?: string | null): boolean {
    if (this.isInitialized && this.client) {
      return true;
    }

    try {
      // Set Agora SDK log level to WARNING to avoid noisy console outputs
      try {
        AgoraRTC.setLogLevel(2);
      } catch {}

      // Configure Agora RTC client for interactive live voice chat
      this.client = AgoraRTC.createClient({
        mode: 'live',
        codec: 'vp8'
      });

      if (appId) {
        this.configuredAppId = appId;
      }

      this.setupClientListeners();
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.error('AgoraVoiceService init error:', err);
      return false;
    }
  }

  /**
   * Set up internal Agora client event listeners
   */
  private setupClientListeners() {
    if (!this.client) return;

    // Remote user published an audio stream -> automatically subscribe and play
    this.client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      if (mediaType === 'audio') {
        try {
          await this.client?.subscribe(user, mediaType);
          user.audioTrack?.play();
        } catch (err) {
          console.error('Error subscribing to remote user audio:', err);
        }
      }
    });

    this.client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
      }
    });

    // Audio Volume Indicator (detects speaking loudness for all users in channel)
    this.client.enableAudioVolumeIndicator();
    this.client.on('volume-indicator', (volumes) => {
      const volMap = new Map<string | number, number>();
      volumes.forEach(v => {
        const lvl = Math.round(v.level);
        volMap.set(v.uid, lvl);
        // Map numeric UID to original string UID and vice versa
        if (typeof v.uid === 'number') {
          const orig = this.numericToUidMap.get(v.uid);
          if (orig) volMap.set(orig, lvl);
        } else if (typeof v.uid === 'string') {
          const num = this.uidToNumericMap.get(v.uid);
          if (num) volMap.set(num, lvl);
        }
      });
      const parsed: AgoraVolumeInfo[] = Array.from(volMap.entries()).map(([k, lvl]) => ({
        uid: k,
        level: lvl
      }));
      this.volumeCallbacks.forEach(cb => cb(parsed));
    });

    // Connection state changes
    this.client.on('connection-state-change', (curState, revState, reason) => {
      this.connectionCallbacks.forEach(cb => cb(curState));
    });

    // Network quality
    this.client.on('network-quality', (stats: NetworkQuality) => {
      this.networkCallbacks.forEach(cb => cb({
        uplink: stats.uplinkNetworkQuality,
        downlink: stats.downlinkNetworkQuality
      }));
    });

    // Token expiring soon -> automatically renew
    this.client.on('token-privilege-will-expire', async () => {
      if (this.currentChannel && this.currentUid) {
        const tokenRes = await this.fetchToken(
          this.currentChannel,
          this.currentUid,
          this.currentRole
        );
        if (tokenRes.token) {
          await this.client?.renewToken(tokenRes.token);
        }
      }
    });
  }

  /**
   * Join an Agora RTC Room channel safely with concurrency control
   */
  public async joinRoom(options: AgoraJoinOptions): Promise<{ success: boolean; isLive: boolean; error?: string }> {
    const { channelName, uid, role, audioQuality = 'standard' } = options;

    // If an ongoing leave operation is in flight, wait for it to complete first
    if (this.inFlightLeavePromise) {
      await this.inFlightLeavePromise;
    }

    // If an identical join is already in progress, return the in-flight promise
    if (this.inFlightJoinPromise) {
      if (this.currentChannel === channelName && String(this.currentUid) === String(uid)) {
        return this.inFlightJoinPromise;
      }
      await this.inFlightJoinPromise;
    }

    // Check if client is already connected
    if (this.client && this.client.connectionState === 'CONNECTED') {
      if (this.currentChannel === channelName && String(this.currentUid) === String(uid)) {
        // Already connected to this exact channel and user!
        if (this.currentRole !== role) {
          await this.switchRole(role, audioQuality);
        }
        return { success: true, isLive: this.isLiveRTC };
      } else {
        // Connected to a different room; cleanly leave before joining the new one
        await this.leaveRoom();
      }
    }

    this.inFlightJoinPromise = (async () => {
      this.initialize(options.appId);

      // Fetch token from server
      const tokenRes = await this.fetchToken(channelName, uid, role);
      const effectiveAppId = options.appId || tokenRes.appId || this.configuredAppId;
      const effectiveToken = options.token || tokenRes.token;

      // Determine deterministic 32-bit integer UID (1 to 2^31 - 1) matching server token
      const numericUid = typeof tokenRes.uid === 'number' && tokenRes.uid > 0
        ? tokenRes.uid
        : getAgoraNumericUid(uid);

      // Register bidirectional mapping
      this.uidToNumericMap.set(String(uid), numericUid);
      this.numericToUidMap.set(numericUid, String(uid));

      this.currentChannel = channelName;
      this.currentUid = uid;
      this.currentNumericUid = numericUid;
      this.currentRole = role;

      // If Agora App ID is present and client is available, join live Agora channel
      if (this.client && effectiveAppId) {
        try {
          // Double-check connection state before calling join
          if (this.client.connectionState === 'CONNECTED') {
            this.isLiveRTC = true;
            if (role === 'publisher') {
              await this.publishMicrophone(audioQuality);
            }
            return { success: true, isLive: true };
          }

          if (this.client.connectionState === 'DISCONNECTING') {
            // Wait for clean disconnection
            let attempts = 0;
            while (this.client.connectionState === 'DISCONNECTING' && attempts < 10) {
              await new Promise(r => setTimeout(r, 100));
              attempts++;
            }
          }

          // Set client role: host/speaker = publisher, audience = audience
          const clientRole = role === 'publisher' ? 'host' : 'audience';
          await this.client.setClientRole(clientRole);

          // Join channel with matching numeric UID
          let joinSucceeded = false;
          try {
            await this.client.join(
              effectiveAppId,
              channelName,
              effectiveToken || null,
              numericUid
            );
            joinSucceeded = true;
          } catch (numErr: any) {
            // If primary join failed with unauthorized error and we have userAccountToken, try userAccount join
            if (tokenRes.userAccountToken && (numErr?.code === 110 || numErr?.message?.includes('NO_AUTHORIZED'))) {
              try {
                await this.client.join(
                  effectiveAppId,
                  channelName,
                  tokenRes.userAccountToken,
                  String(uid)
                );
                joinSucceeded = true;
              } catch (accErr) {
                throw numErr;
              }
            } else {
              throw numErr;
            }
          }

          this.isLiveRTC = true;

          // If joined as publisher (speaker), publish microphone
          if (role === 'publisher') {
            await this.publishMicrophone(audioQuality);
          }

          return { success: true, isLive: true };
        } catch (err: any) {
          // Graceful fallback to high-fidelity audio mode
          console.warn('Live RTC fallback to local high-fidelity mode:', err?.message || err);
          this.isLiveRTC = false;
          
          try {
            if (this.client && (this.client.connectionState === 'CONNECTED' || this.client.connectionState === 'CONNECTING')) {
              await this.client.leave();
            }
          } catch {}

          return { success: true, isLive: false, error: err?.message || 'Voice join fallback' };
        }
      } else {
        // Local Fidelity Mode (when Agora credentials haven't been provided in Settings yet)
        this.isLiveRTC = false;
        return { success: true, isLive: false };
      }
    })();

    try {
      return await this.inFlightJoinPromise;
    } finally {
      this.inFlightJoinPromise = null;
    }
  }

  /**
   * Switch user role dynamically (e.g. promoted from audience to speaker, or stepping down)
   */
  public async switchRole(newRole: AgoraRole, audioQuality: AudioQualitySetting = 'standard'): Promise<boolean> {
    this.currentRole = newRole;

    if (this.client && this.isLiveRTC && this.client.connectionState === 'CONNECTED') {
      try {
        if (newRole === 'publisher') {
          await this.client.setClientRole('host');
          await this.publishMicrophone(audioQuality);
        } else {
          await this.unpublishMicrophone();
          await this.client.setClientRole('audience');
        }
        return true;
      } catch (err) {
        console.warn('Notice: Non-critical Agora role switch:', err);
        return false;
      }
    }
    return true;
  }

  /**
   * Create and publish local microphone audio track with AEC, AGC, and Noise Suppression
   */
  public async publishMicrophone(quality: AudioQualitySetting = 'standard'): Promise<IMicrophoneAudioTrack | null> {
    if (this.localAudioTrack && this.isPublishing) {
      return this.localAudioTrack;
    }

    try {
      if (!this.localAudioTrack) {
        // Configure audio processing options
        const audioConfig = {
          AEC: true, // Acoustic Echo Cancellation
          AGC: true, // Automatic Gain Control
          ANS: true, // Noise Suppression
          encoderConfig: quality === 'high' 
            ? 'high_quality_stereo' as const 
            : (quality === 'low' ? 'speech_low_quality' as const : 'speech_standard' as const)
        };

        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack(audioConfig);
      }

      // If locally muted, ensure track starts disabled
      if (this.isMutedLocally) {
        await this.localAudioTrack.setEnabled(false);
      }

      if (this.client && this.isLiveRTC && this.client.connectionState === 'CONNECTED' && !this.isPublishing) {
        await this.client.publish([this.localAudioTrack]);
        this.isPublishing = true;
      }

      return this.localAudioTrack;
    } catch (err) {
      console.warn('Microphone publish non-critical:', err);
      return null;
    }
  }

  /**
   * Unpublish and close local microphone
   */
  public async unpublishMicrophone() {
    if (this.localAudioTrack) {
      try {
        if (this.client && this.isPublishing && this.client.connectionState === 'CONNECTED') {
          await this.client.unpublish([this.localAudioTrack]);
        }
      } catch (err) {
        // Non-blocking
      } finally {
        this.isPublishing = false;
        try {
          this.localAudioTrack.stop();
          this.localAudioTrack.close();
        } catch {}
        this.localAudioTrack = null;
      }
    }
  }

  /**
   * Mute or Unmute local microphone
   */
  public async setMuted(muted: boolean) {
    this.isMutedLocally = muted;
    if (this.localAudioTrack) {
      try {
        await this.localAudioTrack.setEnabled(!muted);
      } catch (err) {
        console.warn('Error setting mic mute state on track:', err);
      }
    }
  }

  /**
   * Leave Agora channel safely and clean up resources without race conditions
   */
  public async leaveRoom(): Promise<void> {
    if (this.inFlightLeavePromise) {
      return this.inFlightLeavePromise;
    }

    this.inFlightLeavePromise = (async () => {
      try {
        await this.unpublishMicrophone();
        if (this.client && (this.client.connectionState === 'CONNECTED' || this.client.connectionState === 'CONNECTING')) {
          await this.client.leave();
        }
      } catch (err: any) {
        // Suppress benign ERR_REJOIN_NOT_JOINED (code 2025)
        if (!err?.message?.includes('ERR_REJOIN_NOT_JOINED') && err?.code !== 2025) {
          console.warn('Agora leave notice:', err);
        }
      } finally {
        this.currentChannel = null;
        this.currentUid = null;
        this.currentNumericUid = null;
        this.isPublishing = false;
        this.isLiveRTC = false;
        this.inFlightLeavePromise = null;
      }
    })();

    return this.inFlightLeavePromise;
  }

  /**
   * Subscribe to volume indicator events
   */
  public onVolumeIndicator(callback: (volumes: AgoraVolumeInfo[]) => void) {
    this.volumeCallbacks.add(callback);
    return () => this.volumeCallbacks.delete(callback);
  }

  /**
   * Subscribe to connection state changes
   */
  public onConnectionStateChange(callback: (state: ConnectionState) => void) {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  /**
   * Subscribe to network quality updates
   */
  public onNetworkQuality(callback: (quality: { uplink: number; downlink: number }) => void) {
    this.networkCallbacks.add(callback);
    return () => this.networkCallbacks.delete(callback);
  }

  /**
   * Returns whether live Agora RTC is active
   */
  public isLive(): boolean {
    return this.isLiveRTC;
  }

  public getLocalAudioTrack(): IMicrophoneAudioTrack | null {
    return this.localAudioTrack;
  }
}

export const agoraVoiceService = new AgoraVoiceService();
