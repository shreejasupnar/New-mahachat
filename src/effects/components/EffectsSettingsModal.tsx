import React, { useState, useEffect } from 'react';
import { X, Sparkles, Volume2, VolumeX, Eye, Flame, Check } from 'lucide-react';
import { effectsSettings } from '../settings/EffectsSettingsManager';
import { UserEffectSettings } from '../types';

interface EffectsSettingsModalProps {
  onClose: () => void;
}

export const EffectsSettingsModal: React.FC<EffectsSettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<UserEffectSettings>(effectsSettings.getSettings());

  useEffect(() => {
    const unsub = effectsSettings.subscribe(s => setSettings(s));
    return unsub;
  }, []);

  const toggle = (key: keyof UserEffectSettings) => {
    const nextVal = !settings[key];
    effectsSettings.updateSettings({ [key]: nextVal });
  };

  const setGiftLevel = (level: 'full' | 'reduced' | 'off') => {
    effectsSettings.updateSettings({ giftAnimationLevel: level });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">व्हिज्युअल इफेक्ट्स सेटिंग्ज</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Note for Mobile Performance */}
        <p className="text-xs text-slate-400 leading-relaxed">
          कमी क्षमतेच्या मोबाईलसाठी इफेक्ट्स व आवाज नियंत्रित करा जेणेकरून ॲप सुपर-फास्ट चालेल.
        </p>

        {/* 1. Master Switch */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <div>
            <div className="text-sm font-semibold text-white">सर्व इफेक्ट्स (Visual Effects)</div>
            <div className="text-[11px] text-slate-400">ॲपमधील सर्व ॲनिमेशन्स सुरू किंवा बंद</div>
          </div>
          <button
            type="button"
            onClick={() => toggle('effectsEnabled')}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.effectsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.effectsEnabled ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* 2. Gift Animation Level */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <div className="text-sm font-semibold text-white flex items-center justify-between">
            <span>भेटवस्तू ॲनिमेशन (Gift Level)</span>
            <span className="text-xs text-amber-400 font-bold uppercase">{settings.giftAnimationLevel}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['full', 'reduced', 'off'] as const).map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setGiftLevel(lvl)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  settings.giftAnimationLevel === lvl
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {settings.giftAnimationLevel === lvl && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{lvl === 'full' ? 'पूर्ण (Full)' : lvl === 'reduced' ? 'कमी (Light)' : 'बंद (Off)'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Sound Effects */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-2.5">
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-pink-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <div>
              <div className="text-sm font-semibold text-white">इफेक्ट्सचे आवाज (Sound)</div>
              <div className="text-[11px] text-slate-400">तुतारी, ढोल आणि भेटवस्तू धून</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle('soundEnabled')}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.soundEnabled ? 'bg-pink-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.soundEnabled ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* 4. Ambient Particles */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
          <div>
            <div className="text-sm font-semibold text-white">वातावरणीय काजवे/पाऊस (Particles)</div>
            <div className="text-[11px] text-slate-400">बॅकग्राउंडमधील तरंगते कण</div>
          </div>
          <button
            type="button"
            onClick={() => toggle('ambientParticlesEnabled')}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.ambientParticlesEnabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.ambientParticlesEnabled ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Save & Close */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm shadow-lg hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer"
        >
          बदल जतन करा (Done)
        </button>
      </div>
    </div>
  );
};
