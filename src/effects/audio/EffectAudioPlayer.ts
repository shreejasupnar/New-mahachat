// MahaChat Native Web Audio Synthesizer for Effects
// Zero network latency, zero external asset dependencies, low memory footprint

import { SoundPreset } from '../types';

class EffectAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (typeof window === 'undefined') return null;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return null;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public playPreset(preset?: SoundPreset) {
    if (this.isMuted || !preset) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      switch (preset) {
        case 'tutari':
        case 'fanfare': {
          // Authentic Maharashtrian fanfare / tutari arpeggio: D5 -> G5 -> B5 -> D6
          const notes = [587.33, 783.99, 987.77, 1174.66];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);

            gain.gain.setValueAtTime(0, now + idx * 0.12);
            gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.4);
          });
          break;
        }

        case 'drum': {
          // Low resonant Dhol-Tasha thud
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }

        case 'sparkle':
        case 'pop': {
          // High pitch gentle chime
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(2400, now + 0.15);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'whoosh': {
          // Soft noise burst for entrance
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);

          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        case 'levelup':
        case 'victory': {
          // Triumphant ascending sequence: C5 -> E5 -> G5 -> C6
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.09);

            gain.gain.setValueAtTime(0.18, now + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.09);
            osc.stop(now + idx * 0.09 + 0.35);
          });
          break;
        }

        case 'chime':
        default: {
          const notes = [659.25, 880, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);

            gain.gain.setValueAtTime(0.15, now + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.28);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.3);
          });
          break;
        }
      }
    } catch {
      // Graceful silence on browser audio restriction
    }
  }
}

export const effectAudio = new EffectAudioPlayer();
