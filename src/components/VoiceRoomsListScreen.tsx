import React, { useState, useEffect } from 'react';
import { MAHARASHTRA_DISTRICTS, DIVISIONS, District } from '../data/districts';
import { DistrictIcon } from './DistrictIcon';
import { db, UserProfile } from '../lib/firebase';
import { collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { 
  Radio, 
  Search, 
  Users, 
  Mic, 
  Volume2, 
  ArrowRight, 
  Sparkles,
  MapPin,
  X
} from 'lucide-react';

interface VoiceRoomsListScreenProps {
  currentUserProfile: UserProfile | null;
  onSelectVoiceRoom: (districtId: string) => void;
  onExploreDistricts: () => void;
}

export const VoiceRoomsListScreen: React.FC<VoiceRoomsListScreenProps> = ({
  currentUserProfile,
  onSelectVoiceRoom,
  onExploreDistricts
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [roomParticipantsCount, setRoomParticipantsCount] = useState<Record<string, { total: number; speakers: number }>>({});

  // Real-time listener for active participants across featured/popular districts
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    MAHARASHTRA_DISTRICTS.forEach((d) => {
      try {
        const partsRef = collection(db, 'districts', d.id, 'voiceRooms', 'active', 'participants');
        const unsub = onSnapshot(partsRef, (snapshot) => {
          let total = 0;
          let speakers = 0;
          const now = Date.now();
          const STALE_TIMEOUT_MS = 35000;

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const lastPing = data.lastPing || data.joinedAt;
            const lastPingMs = lastPing?.toMillis 
              ? lastPing.toMillis() 
              : (lastPing?.seconds ? lastPing.seconds * 1000 : null);
            const isAlive = !lastPingMs || (now - lastPingMs < STALE_TIMEOUT_MS);

            if (isAlive) {
              total += 1;
              if (data.role === 'speaker' || (data.seatIndex !== null && data.seatIndex !== undefined)) {
                speakers += 1;
              }
            } else {
              deleteDoc(docSnap.ref).catch(() => {});
            }
          });
          setRoomParticipantsCount((prev) => ({
            ...prev,
            [d.id]: { total, speakers }
          }));
        }, (err) => {
          // ignore permission or non-existent
        });
        unsubs.push(unsub);
      } catch (e) {
        // Fallback
      }
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

  const userDistrict = MAHARASHTRA_DISTRICTS.find(d => d.id === currentUserProfile?.district);
  const userDistrictCounts = userDistrict ? (roomParticipantsCount[userDistrict.id] || { total: 0, speakers: 0 }) : { total: 0, speakers: 0 };

  const filteredDistricts = MAHARASHTRA_DISTRICTS.filter((district) => {
    const matchesDivision = selectedDivision === 'all' || district.divisionEn === selectedDivision;
    const matchesSearch = 
      district.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      district.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      district.landmarkMr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDivision && matchesSearch;
  });

  return (
    <div id="voice-rooms-list-screen" className="flex-1 flex flex-col bg-slate-950 text-white min-h-screen pb-24 select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3.5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)] glossy-dark-top-edge">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600/30 to-indigo-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.25)]">
            <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white leading-tight flex items-center gap-2">
              <span>जिल्हा व्हॉईस कट्टा</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold shadow-xs">
                १० सीट्स
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              सर्व ३६ जिल्ह्यांचे थेट ऑडिओ कट्टे
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        {/* User's Home District Voice Room Priority Card */}
        {userDistrict && (
          <div
            onClick={() => onSelectVoiceRoom(userDistrict.id)}
            className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 rounded-3xl p-4 border border-blue-500/40 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.8)] cursor-pointer hover:border-blue-400/70 transition-all duration-300 group glossy-dark-top-edge active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>तुमचा स्वतःचा जिल्हा कट्टा</span>
              </span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/40 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>
                  {userDistrictCounts.total > 0 ? `${userDistrictCounts.total} उपस्थित` : 'लाईव्ह रूम उपलब्ध'}
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-3 flex items-center gap-3.5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/15 shadow-inner"
                style={{ backgroundColor: `${userDistrict.color}30` }}
              >
                <DistrictIcon type={userDistrict.iconType} color={userDistrict.color} size={32} />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors truncate">
                  {userDistrict.nameMr} व्हॉईस कट्टा
                </h2>
                <p className="text-xs text-slate-300 truncate font-medium">
                  {userDistrict.nameEn} • {userDistrict.landmarkMr}
                </p>
                <div className="text-[11px] text-blue-200 mt-1 flex items-center gap-2 font-medium">
                  <span className="flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{userDistrictCounts.speakers} / १० सीट्स व्यापल्या</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx < userDistrictCounts.speakers
                        ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                    title={`सीट ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white rounded-xl text-xs font-black shadow-[0_4px_12px_rgba(37,99,235,0.4)] flex items-center gap-1.5 transition-all cursor-pointer border border-blue-400/40"
              >
                <span>कट्ट्यात जा</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="voice-room-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="जिल्हा व्हॉईस रूम शोधा... (Search district)"
            className="w-full pl-10 pr-9 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 active:scale-90 transition-transform"
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
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)] border border-blue-400/40'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {div.nameMr}
            </button>
          ))}
        </div>

        {/* Voice Rooms Grid/List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              सर्व ३६ जिल्ह्यांचे कट्टे ({filteredDistricts.length})
            </h3>
            <span className="text-[11px] text-blue-400 font-bold">प्रत्येक रूममध्ये १० सीट्स</span>
          </div>

          {filteredDistricts.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 card-glossy-dark">
              <p className="text-slate-400 text-xs">कोणताही जिल्हा सापडला नाही.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedDivision('all'); }}
                className="mt-2 text-xs text-blue-400 font-bold hover:underline"
              >
                सर्व कट्टे दाखवा
              </button>
            </div>
          ) : (
            filteredDistricts.map((district) => {
              const counts = roomParticipantsCount[district.id] || { total: 0, speakers: 0 };

              return (
                <div
                  key={district.id}
                  id={`voice-room-card-${district.id}`}
                  onClick={() => onSelectVoiceRoom(district.id)}
                  className="card-glossy-dark hover:bg-slate-800/90 active:scale-[0.99] border border-slate-800 hover:border-blue-500/50 rounded-2xl p-3.5 transition-all shadow-md cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* District Emblem */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform shadow-inner"
                      style={{ backgroundColor: `${district.color}25` }}
                    >
                      <DistrictIcon type={district.iconType} color={district.color} size={26} />
                    </div>

                    {/* Room Info */}
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h4 className="font-black text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                          {district.nameMr} व्हॉईस कट्टा
                        </h4>
                        <span className="text-[11px] text-slate-400 truncate font-medium">
                          ({district.nameEn})
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 truncate font-medium">
                        {district.landmarkMr}
                      </div>

                      {/* Seats & Active Counts */}
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className={`w-1.5 h-1.5 rounded-full ${counts.total > 0 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-slate-500'}`} />
                          <span>{counts.total > 0 ? `${counts.total} उपस्थित` : '० उपस्थित'}</span>
                        </span>

                        <span className="flex items-center gap-1 text-cyan-300">
                          <Mic className="w-3 h-3 text-cyan-400" />
                          <span>{counts.speakers} / १० सीट्स</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Join Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVoiceRoom(district.id);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600/30 hover:bg-blue-600 active:scale-95 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl text-xs font-black transition-all shrink-0 ml-2 group-hover:shadow-[0_0_12px_rgba(37,99,235,0.4)] cursor-pointer"
                  >
                    बसा
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
