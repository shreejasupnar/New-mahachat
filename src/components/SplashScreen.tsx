import React from 'react';
import { MahaChatLogo } from './MahaChatLogo';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div 
      id="splash-screen" 
      onClick={onStart}
      className="relative min-h-screen w-full flex flex-col justify-between items-center bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-950 text-white overflow-hidden cursor-pointer select-none"
    >
      {/* Background Image of Sahyadri Fort with saffron flag */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/src/assets/images/mahat_fort_hero_1789191793344.jpg" 
          alt="Maharashtra Fort"
          className="w-full h-full object-cover object-center opacity-85 scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Gradients overlay matching mockup */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/80 via-blue-900/30 to-slate-950/95" />
      </div>

      {/* Top Header Content */}
      <div className="relative z-10 pt-10 px-4 flex flex-col items-center text-center">
        {/* White circle card around logo */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-3xl shadow-xl border border-white/40 mb-3">
          <MahaChatLogo size="lg" theme="light" />
        </div>
        
        <h2 className="text-white font-semibold text-sm sm:text-base tracking-wide drop-shadow-md max-w-xs text-center">
          महाराष्ट्रातील प्रत्येक जिल्ह्याचा स्वतंत्र चॅट रूम
        </h2>

        {/* Yellow Banner ribbon matching mockup */}
        <div className="mt-4 relative transform -rotate-1 hover:rotate-0 transition-transform">
          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-slate-900 font-extrabold text-base sm:text-lg px-6 py-2 rounded-xl shadow-lg border-2 border-yellow-200 flex items-center gap-2">
            <span>या ना गप्पा मारायला...</span>
            <span className="text-xl">💬</span>
          </div>
        </div>
      </div>

      {/* Center Maharashtra Map Graphic */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-6 px-4">
        <div className="relative w-64 h-56 sm:w-72 sm:h-64 flex items-center justify-center">
          {/* Subtle glow */}
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
          
          {/* Stylized Maharashtra District Map Silhouette */}
          <svg viewBox="0 0 320 280" className="w-full h-full drop-shadow-2xl filter" fill="none">
            {/* Konkan Coast */}
            <path d="M48,150 Q42,190 58,240 Q75,255 88,230 Q92,185 85,150 Z" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Mumbai & Thane */}
            <path d="M52,110 Q65,110 75,120 Q68,140 50,140 Q45,125 52,110 Z" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Western Maharashtra (Pune, Satara, Kolhapur) */}
            <path d="M85,140 Q130,130 145,170 Q135,225 90,225 Q82,180 85,140 Z" fill="#D97706" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Nashik & Khandesh */}
            <path d="M75,70 Q130,55 150,90 Q130,130 80,120 Z" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Marathwada (Sambhajinagar, Nanded, Latur) */}
            <path d="M145,110 Q210,110 215,180 Q160,200 140,165 Z" fill="#9333EA" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Vidarbha (Nagpur, Amravati, Chandrapur) */}
            <path d="M195,50 Q290,55 295,120 Q280,180 205,160 Q200,100 195,50 Z" fill="#16A34A" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Central Heart of Maharashtra */}
            <circle cx="150" cy="140" r="14" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M146,134 L154,140 L146,146 Z" fill="white" />
          </svg>
        </div>

        {/* Tap to enter hint */}
        <button 
          id="splash-enter-button"
          onClick={onStart}
          className="mt-3 bg-white text-blue-700 font-bold px-8 py-3 rounded-full shadow-2xl hover:bg-blue-50 active:scale-95 transition-all text-sm tracking-wide flex items-center gap-2 border border-blue-100"
        >
          <span>सुरू करा • Enter App</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Bottom Footer Tagline matching mockup */}
      <div className="relative z-10 pb-8 px-6 text-center w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold tracking-wider text-blue-200 mb-2">
          <span>District Chats</span>
          <span>|</span>
          <span>Friends</span>
          <span>|</span>
          <span>Fun</span>
        </div>
        <p className="text-[11px] text-slate-400 font-normal">
          महाराष्ट्र जोडतो... MahaChat!
        </p>
      </div>
    </div>
  );
};
