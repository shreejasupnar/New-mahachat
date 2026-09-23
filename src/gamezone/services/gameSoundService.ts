class GameSoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  private vibrate(pattern: number | number[]) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  }

  // 1. Button / Tap Sound
  public playTap() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);

    this.vibrate(10);
  }

  // 2. Countdown Beeps (3... 2... 1... START!)
  public playCountdown(isFinal: boolean = false) {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';

    const freq = isFinal ? 880 : 440; // A5 for GO, A4 for 3,2,1
    const dur = isFinal ? 0.35 : 0.15;

    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);

    this.vibrate(isFinal ? [50, 50, 100] : 30);
  }

  // 3. Coin Jingle / Deduction
  public playCoin() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    [987.77, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
    });

    this.vibrate([20, 30, 40]);
  }

  // 4. Dice Roll / Turn Move
  public playDiceRoll() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200 + Math.random() * 300, ctx.currentTime + i * 0.06);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.06 + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.05);
    }

    this.vibrate([15, 20, 15, 20]);
  }

  // 5. Piece Move / Board Strike
  public playMove() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);

    this.vibrate(15);
  }

  // 6. Viti Dandu Strike (Traditional Wood Hit + Whoosh)
  public playVitiDanduHit() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Wood crack oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);

    // Sine whoosh
    const whoosh = ctx.createOscillator();
    const whooshGain = ctx.createGain();
    whoosh.type = 'sine';
    whoosh.frequency.setValueAtTime(150, ctx.currentTime + 0.08);
    whoosh.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);

    whooshGain.gain.setValueAtTime(0.2, ctx.currentTime + 0.08);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    whoosh.connect(whooshGain);
    whooshGain.connect(ctx.destination);
    whoosh.start(ctx.currentTime + 0.08);
    whoosh.stop(ctx.currentTime + 0.35);

    this.vibrate([30, 40, 60]);
  }

  // 7. Victory Fanfare
  public playVictory() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const start = ctx.currentTime + idx * 0.12;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });

    this.vibrate([50, 40, 60, 40, 150]);
  }

  // 8. Defeat / Match End
  public playDefeat() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [440, 415.3, 392, 349.23]; // Downwards
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const start = ctx.currentTime + idx * 0.14;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.22);
    });

    this.vibrate([60, 30, 80]);
  }

  // Win alias for Victory
  public playWin() {
    this.playVictory();
  }

  // 12. In-Game Chat Message Chime
  public playMessage() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    [587.33, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const start = ctx.currentTime + idx * 0.08;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.12);
    });

    this.vibrate(25);
  }
}

export const gameSound = new GameSoundService();
