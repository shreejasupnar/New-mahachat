import React from 'react';
import { X, Download, ExternalLink, Sparkles } from 'lucide-react';
import { MahaChatLogo } from './MahaChatLogo';

interface LogoDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoDownloadModal: React.FC<LogoDownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const logoJpgUrl = '/assets/mahachat_logo.jpg';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = logoJpgUrl;
    link.download = 'MahaChat_Official_Logo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-amber-200/80 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative cultural backdrop glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚩</span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                MahaChat Official Logo (JPG)
              </h3>
              <p className="text-[11px] text-amber-700 font-bold">
                महाराष्ट्राची अस्मिता व अधिकृत लोगो (High Resolution)
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* High Resolution Preview Card */}
        <div className="relative z-10 bg-gradient-to-b from-amber-50/60 to-orange-50/40 p-4 rounded-2xl border border-amber-200/70 flex flex-col items-center justify-center mb-5 group">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-xl border-2 border-amber-400/90 relative bg-white flex items-center justify-center">
            <img 
              src={logoJpgUrl} 
              alt="MahaChat Cultural Logo in JPG" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-black text-amber-300 border border-white/20">
              JPG • 640 KB
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>राजमुद्रा अष्टकोन • भगवा फेटा • तुतारी प्रतीक</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 relative z-10">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>डाउनलोड करा (Download JPG)</span>
          </button>

          <a
            href={logoJpgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>नवीन टॅबमध्ये पूर्ण आकार पहा (Open Full Size in Tab)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
