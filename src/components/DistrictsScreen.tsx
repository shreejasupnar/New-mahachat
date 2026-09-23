import React, { useState, useEffect } from 'react';
import { MAHARASHTRA_DISTRICTS, DIVISIONS, District } from '../data/districts';
import { DistrictIcon } from './DistrictIcon';
import { db, UserProfile } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Search, ChevronRight, MapPin, X, Radio } from 'lucide-react';

interface DistrictsScreenProps {
  onBack: () => void;
  onSelectDistrict: (districtId: string) => void;
  onSelectVoiceRoom?: (districtId: string) => void;
}

export const DistrictsScreen: React.FC<DistrictsScreenProps> = ({
  onBack,
  onSelectDistrict,
  onSelectVoiceRoom
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [districtOnlineCounts, setDistrictOnlineCounts] = useState<Record<string, number>>({});

  // Real presence calculation for all 36 districts
  // NO FAKE NUMBERS: strictly real from Firestore
  useEffect(() => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('isOnline', '==', true));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const counts: Record<string, number> = {};
        const now = Date.now();

        snapshot.forEach((doc) => {
          const data = doc.data() as UserProfile;
          if (data.district) {
            const lastActiveMs = data.lastActive?.toMillis 
              ? data.lastActive.toMillis() 
              : (data.lastActive?.seconds ? data.lastActive.seconds * 1000 : 0);
            // Only count if active within the last 70 seconds (real active presence)
            if (!lastActiveMs || (now - lastActiveMs) < 70000) {
              counts[data.district] = (counts[data.district] || 0) + 1;
            }
          }
        });
        setDistrictOnlineCounts(counts);
      }, (err) => {
        console.warn('Presence listener warning:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      // Fallback
    }
  }, []);

  const filteredDistricts = MAHARASHTRA_DISTRICTS.filter((district) => {
    const matchesDivision = selectedDivision === 'all' || district.divisionEn === selectedDivision;
    const matchesSearch = 
      district.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      district.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      district.landmarkMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      district.landmark.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDivision && matchesSearch;
  });

  return (
    <div id="districts-screen" className="flex-1 flex flex-col bg-slate-100/80 min-h-screen pb-20 select-none">
      {/* Top Header matching Mockup Screen 4 */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 flex items-center gap-3 shadow-[0_2px_12px_rgba(15,23,42,0.03)] glossy-top-edge">
        <button
          id="districts-back-button"
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 shadow-xs active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-900 leading-tight">जिल्हे (Districts)</h1>
          <p className="text-[11px] text-slate-500 font-medium">महाराष्ट्राचे सर्व ३६ जिल्हे</p>
        </div>
      </header>

      {/* Search & Division Filters */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 space-y-2.5 shadow-xs">
        {/* Search Input matching Mockup Screen 4: "जिल्हा शोधा..." */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="district-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="जिल्हा शोधा... (Search district)"
            className="w-full pl-10 pr-9 py-2.5 bg-slate-100/90 border border-slate-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Division Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {DIVISIONS.map((div) => (
            <button
              key={div.id}
              type="button"
              onClick={() => setSelectedDivision(div.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                selectedDivision === div.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)] btn-glossy'
                  : 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 border border-slate-200/60'
              }`}
            >
              {div.nameMr}
            </button>
          ))}
        </div>
      </div>

      {/* Districts List matching Mockup Screen 4 */}
      <div className="flex-1 p-4 max-w-lg mx-auto w-full space-y-2.5">
        {filteredDistricts.length === 0 ? (
          <div className="p-8 text-center card-glossy rounded-2xl border border-slate-200">
            <p className="text-slate-600 text-sm font-medium">कोणताही जिल्हा आढळला नाही.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedDivision('all'); }}
              className="mt-3 text-xs text-blue-600 font-bold hover:underline"
            >
              सर्व ३६ जिल्हे दाखवा
            </button>
          </div>
        ) : (
          filteredDistricts.map((district) => {
            const count = districtOnlineCounts[district.id] || 0;
            return (
              <div
                key={district.id}
                id={`district-item-${district.id}`}
                onClick={() => onSelectDistrict(district.id)}
                className="card-glossy rounded-2xl p-3.5 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* District Landmark Icon Circle matching Screen 4 */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs border border-white/50"
                    style={{ backgroundColor: `${district.color}18` }}
                  >
                    <DistrictIcon type={district.iconType} color={district.color} size={28} />
                  </div>

                  {/* District Name & Honest Online Count */}
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors truncate">
                        {district.nameMr}
                      </h3>
                      <span className="text-xs text-slate-500 truncate font-medium">
                        ({district.nameEn})
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 truncate font-medium">
                      {district.landmarkMr}
                    </div>

                    {/* Online status indicator matching Mockup Screen 4 */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          count > 0 ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      <span
                        className={`text-[11px] font-bold ${
                          count > 0 ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {count > 0 ? `${count} ऑनलाइन` : 'अजून कोणी ऑनलाइन नाही'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Direct Voice Room & Chevron */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {onSelectVoiceRoom && (
                    <button
                      type="button"
                      id={`district-voice-button-${district.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVoiceRoom(district.id);
                      }}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-blue-200/80 hover:border-blue-600 shadow-xs active:scale-95"
                      title={`${district.nameMr} व्हॉईस कट्टा (१० सीट्स)`}
                    >
                      <Radio className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">व्हॉईस</span>
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
