import React from 'react';
import { Home, Compass, Radio, Crown, User, Gamepad2, Video } from 'lucide-react';
import { isLiveFeatureEnabled } from '../features/live';

export type NavTab = 'home' | 'districts' | 'voice' | 'live' | 'gamezone' | 'vip' | 'profile';

interface BottomNavigationProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab
}) => {
  const isLiveActive = isLiveFeatureEnabled();

  const tabs = [
    { id: 'home' as NavTab, labelMr: 'होम', labelEn: 'Home', icon: Home },
    { id: 'districts' as NavTab, labelMr: 'जिल्हे', labelEn: 'Districts', icon: Compass },
    { id: 'voice' as NavTab, labelMr: 'व्हॉईस', labelEn: 'Voice', icon: Radio, highlight: true },
    ...(isLiveActive ? [{ id: 'live' as NavTab, labelMr: 'लाईव्ह', labelEn: 'Live', icon: Video, liveHighlight: true }] : []),
    { id: 'gamezone' as NavTab, labelMr: 'गेम झोन', labelEn: 'Game Zone', icon: Gamepad2, gameHighlight: true },
    { id: 'vip' as NavTab, labelMr: 'VIP केंद्र', labelEn: 'VIP', icon: Crown, storeHighlight: true },
    { id: 'profile' as NavTab, labelMr: 'प्रोफाइल', labelEn: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 py-1.5 px-2 shadow-[0_-4px_25px_rgba(15,23,42,0.06)] select-none glossy-top-edge">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 cursor-pointer relative active:scale-90 ${
                isActive
                  ? (tab as any).liveHighlight
                    ? 'text-rose-600 font-bold scale-105'
                    : tab.gameHighlight
                    ? 'text-orange-600 font-bold scale-105'
                    : tab.storeHighlight 
                    ? 'text-amber-600 font-bold scale-105' 
                    : 'text-blue-600 font-bold scale-105'
                  : (tab as any).liveHighlight
                    ? 'text-rose-500 hover:text-rose-600'
                    : tab.gameHighlight
                    ? 'text-orange-500 hover:text-orange-600'
                    : tab.storeHighlight 
                    ? 'text-amber-600/80 hover:text-amber-700' 
                    : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative p-1 rounded-xl transition-all">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive 
                    ? (tab as any).liveHighlight
                      ? 'stroke-[2.5px] text-rose-600 drop-shadow-[0_2px_8px_rgba(225,29,72,0.4)]'
                      : tab.gameHighlight
                      ? 'stroke-[2.5px] text-orange-600 drop-shadow-[0_2px_8px_rgba(234,88,12,0.4)]'
                      : tab.storeHighlight
                      ? 'stroke-[2.5px] text-amber-600 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
                      : 'stroke-[2.5px] text-blue-600 drop-shadow-[0_2px_8px_rgba(37,99,235,0.35)]' 
                    : 'stroke-2'
                } ${(tab as any).liveHighlight ? 'text-rose-500' : tab.gameHighlight ? 'text-orange-500' : tab.storeHighlight ? 'text-amber-500' : ''}`} />
                {(tab as any).liveHighlight && !isActive && (
                  <span className="absolute 1 top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
                {tab.highlight && !isActive && (
                  <span className="absolute 1 top-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
                {tab.gameHighlight && !isActive && (
                  <span className="absolute 1 top-0.5 right-0.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
                {isActive && (
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full ${
                    (tab as any).liveHighlight
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]'
                      : tab.gameHighlight
                      ? 'bg-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.8)]'
                      : tab.storeHighlight 
                      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' 
                      : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]'
                  }`} />
                )}
              </div>
              <span className={`text-[10px] tracking-tight transition-colors whitespace-nowrap ${isActive ? 'font-black' : 'font-medium'}`}>
                {tab.labelMr}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
