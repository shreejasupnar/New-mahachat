import React from 'react';
import { motion } from 'motion/react';

export const ParavarchyaGappaTheme: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Deep Rustic Evening Village Sky with Warm Horizon */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b1008] via-[#2a1708] to-[#120803]" />

      {/* 2. Distant Sahyadri Mountain Silhouette */}
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="absolute bottom-20 left-0 w-full h-36 opacity-35 text-[#0d0703] fill-current"
      >
        <path d="M0,192L60,181.3C120,171,240,149,360,165.3C480,181,600,235,720,229.3C840,224,960,160,1080,138.7C1200,117,1320,139,1380,149.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
      </svg>

      {/* 3. Traditional Village "Par" (Circular stone foundation platform at base) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] max-w-2xl h-44 rounded-t-[100px] bg-gradient-to-t from-[#1c120a] via-[#24170d] to-[#2f1f12]/80 border-t-2 border-amber-800/40 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] opacity-90" />

      {/* 4. Large Majestic Banyan Tree (वडाचे झाड) Canopy at Top */}
      <div className="absolute -top-12 -left-16 -right-16 h-48 opacity-80 pointer-events-none">
        {/* Soft Organic Leaf Clusters with gentle breeze sway */}
        <motion.div
          animate={{ x: [-3, 3, -3], rotate: [-0.5, 0.5, -0.5] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="relative w-full h-full"
        >
          {/* Main Leaf Silhouettes */}
          <svg viewBox="0 0 1200 300" preserveAspectRatio="none" className="w-full h-full fill-[#0d1f11]/75">
            <path d="M 0,0 C 150,160 300,70 450,150 C 600,210 750,90 900,160 C 1050,210 1150,110 1200,0 Z" />
          </svg>
          {/* Hanging aerial prop roots (पारंब्या) */}
          <div className="absolute top-16 left-12 w-0.5 h-36 bg-gradient-to-b from-amber-950/70 to-transparent" />
          <div className="absolute top-20 right-16 w-0.5 h-32 bg-gradient-to-b from-amber-950/70 to-transparent" />
        </motion.div>
      </div>

      {/* 5. Traditional Warm Evening Village Lanterns (कंदील / दिवा) */}
      {/* Left Lantern */}
      <div className="absolute top-16 left-6 flex flex-col items-center">
        <div className="w-0.5 h-8 bg-amber-800/60" />
        <motion.div
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="relative"
        >
          {/* Lantern Glow Aura */}
          <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-lg scale-150 animate-pulse" />
          <div className="px-2 py-1.5 rounded-lg bg-gradient-to-b from-amber-900 via-amber-700 to-amber-950 border border-amber-500/60 shadow-md text-xs">
            🪔
          </div>
        </motion.div>
      </div>

      {/* Right Lantern */}
      <div className="absolute top-20 right-8 flex flex-col items-center">
        <div className="w-0.5 h-6 bg-amber-800/60" />
        <motion.div
          animate={{ rotate: [2, -2, 2] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-lg scale-150 animate-pulse" />
          <div className="px-2 py-1.5 rounded-lg bg-gradient-to-b from-amber-900 via-amber-700 to-amber-950 border border-amber-500/60 shadow-md text-xs">
            🏮
          </div>
        </motion.div>
      </div>

      {/* 6. Subtle Cultural Heading Badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/30 backdrop-blur-xs text-[10px] font-bold text-amber-300 flex items-center gap-1.5 shadow-xs">
        <span>🌳</span>
        <span>परावरच्या गप्पा • गावचा पार</span>
      </div>
    </div>
  );
};
