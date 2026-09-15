import React from 'react';
import { Bell, X, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 border border-slate-100">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">सूचना (Notifications)</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Honest Empty State - STRICT PROMPT REQUIREMENT: "नवीन सूचना नाहीत." */}
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">नवीन सूचना नाहीत.</p>
          <p className="text-xs text-slate-400 max-w-[220px]">
            तुमच्या जिल्ह्याचे नवीन अपडेट किंवा संदेश आल्यास येथे दिसतील.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          बंद करा
        </button>
      </div>
    </div>
  );
};
