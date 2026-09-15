import React from 'react';
import { X, ShieldCheck, Heart, Volume2, Award } from 'lucide-react';

interface PartyRoomRulesModalProps {
  onClose: () => void;
}

export const PartyRoomRulesModal: React.FC<PartyRoomRulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-pink-500/40 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h3 className="font-bold text-base text-pink-200">व्हॉईस पार्टी रूम नियम (Rules)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-purple-950/50 border border-purple-500/30">
            <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-pink-200">आदर आणि सन्मान</p>
              <p className="text-slate-300 mt-0.5">सर्व स्पीकर्स व प्रेक्षकांशी सौजन्याने आणि सन्मानाने बोला. अनुचित भाषा वापरण्यास सक्त मनाई आहे.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-purple-950/50 border border-purple-500/30">
            <Volume2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-cyan-200">माइक शिष्टाचार</p>
              <p className="text-slate-300 mt-0.5">जेव्हा इतर सदस्य बोलत असतील तेव्हा आपला माइक म्यूट ठेवा जेणेकरून रूममध्ये चांगला आवाज येईल.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-purple-950/50 border border-purple-500/30">
            <Award className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-200">भेटवस्तू व रँकिंग (Combos)</p>
              <p className="text-slate-300 mt-0.5">स्पीकर्सना गुलाब 🌹 किंवा सांस्कृतिक भेटवस्तू पाठवून रँकिंगमध्ये पहिले स्थान मिळवा.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-purple-950/50 border border-purple-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-200">होस्ट नियंत्रण व मॉडरेटर</p>
              <p className="text-slate-300 mt-0.5">होस्ट आवश्यकतेनुसार इन-रूम चॅट साफ करू शकतात आणि सीट्स नियंत्रित करू शकतात.</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
        >
          समजले (I Agree)
        </button>
      </div>
    </div>
  );
};
