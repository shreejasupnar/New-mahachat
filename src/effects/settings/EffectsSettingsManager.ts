// MahaChat Effects Settings Store
// Allows users on low-end mobile devices to customize animations, sounds, and particle density

import { UserEffectSettings } from '../types';

const STORAGE_KEY = 'mahachat_effects_settings';

const DEFAULT_SETTINGS: UserEffectSettings = {
  effectsEnabled: true,
  giftAnimationLevel: 'full', // 'full' | 'reduced' | 'off'
  soundEnabled: true,
  entranceEffectsEnabled: true,
  ambientParticlesEnabled: true
};

class EffectsSettingsManager {
  private settings: UserEffectSettings;
  private listeners: Set<(settings: UserEffectSettings) => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): UserEffectSettings {
    try {
      if (typeof window === 'undefined') return DEFAULT_SETTINGS;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public getSettings(): UserEffectSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<UserEffectSettings>) {
    this.settings = { ...this.settings, ...partial };
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      }
    } catch {}
    this.notify();
  }

  public subscribe(listener: (settings: UserEffectSettings) => void): () => void {
    this.listeners.add(listener);
    listener(this.getSettings());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const current = this.getSettings();
    this.listeners.forEach(fn => fn(current));
  }
}

export const effectsSettings = new EffectsSettingsManager();
