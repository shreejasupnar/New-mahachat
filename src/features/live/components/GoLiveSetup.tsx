import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  FlipHorizontal, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  ArrowLeft, 
  Sparkles, 
  SlidersHorizontal,
  Flame,
  Music,
  MapPin,
  Gamepad2,
  BookOpen,
  Radio
} from 'lucide-react';
import { UserProfile } from '../../../lib/firebase';
import { createMediaProvider, LiveMediaProvider, LiveKitProvider } from '../providers';
import { createLiveStream, LiveStream } from '../services/streamService';
import { fetchLiveToken, checkLiveStatus, LiveStatusResponse } from '../services/liveApi';
import { VideoTile } from './VideoTile';
import { LIVE_FILTERS, LiveFilter } from '../config/filters';
import { FilterPickerSheet } from './FilterPickerSheet';
import { AudioOnlyVisualizer } from './AudioOnlyVisualizer';

interface GoLiveSetupProps {
  currentUserProfile: UserProfile | null;
  onBack: () => void;
  onStreamStarted: (stream: LiveStream, provider: LiveMediaProvider) => void;
}

const CATEGORIES = [
  { id: 'chitchat', labelMr: 'गप्पागोष्टी (Chitchat)', icon: Flame, color: 'from-rose-500 to-pink-600' },
  { id: 'district', labelMr: 'माझा जिल्हा (District)', icon: MapPin, color: 'from-blue-500 to-cyan-600' },
  { id: 'singing', labelMr: 'गाणी व संगीत (Singing)', icon: Music, color: 'from-amber-500 to-orange-600' },
  { id: 'shayari', labelMr: 'शायरी व कविता (Poetry)', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
  { id: 'gaming', labelMr: 'गेमिंग (Gaming)', icon: Gamepad2, color: 'from-purple-500 to-indigo-600' },
] as const;

export const GoLiveSetup: React.FC<GoLiveSetupProps> = ({
  currentUserProfile,
  onBack,
  onStreamStarted,
}) => {
  const [streamTitle, setStreamTitle] = useState(`${currentUserProfile?.displayName || 'मित्र'} यांचा थेट संवाद`);
  const [selectedCategory, setSelectedCategory] = useState<'chitchat' | 'singing' | 'district' | 'gaming' | 'shayari'>('chitchat');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<LiveFilter>(LIVE_FILTERS[0]);
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [liveKitStatus, setLiveKitStatus] = useState<LiveStatusResponse | null>(null);

  const providerRef = useRef<LiveMediaProvider | null>(null);

  useEffect(() => {
    checkLiveStatus().then(status => {
      setLiveKitStatus(status);
    });

    const provider = createMediaProvider();
    providerRef.current = provider;

    let mounted = true;
    provider.publish({
      video: true,
      audio: true,
      facingMode: 'user',
    }).then(() => {
      if (mounted) {
        setPreviewStream(provider.getLocalStream());
      }
    }).catch((err) => {
      console.warn('Could not initialize local camera preview:', err);
    });

    return () => {
      mounted = false;
      // Do not unpublish if starting stream, else clean up
      if (!isStarting && providerRef.current) {
        providerRef.current.unpublish().catch(() => {});
      }
    };
  }, []);

  const handleToggleAudio = async () => {
    if (providerRef.current) {
      const next = !isAudioEnabled;
      await providerRef.current.toggleAudio(next);
      setIsAudioEnabled(next);
    }
  };

  const handleToggleVideo = async () => {
    if (providerRef.current) {
      const next = !isVideoEnabled;
      await providerRef.current.toggleVideo(next);
      setIsVideoEnabled(next);
      setPreviewStream(providerRef.current.getLocalStream());
    }
  };

  const handleFlipCamera = async () => {
    if (providerRef.current) {
      await providerRef.current.flipCamera();
      setIsFrontCamera(!isFrontCamera);
      setPreviewStream(providerRef.current.getLocalStream());
    }
  };

  const handleModeChange = async (audioOnly: boolean) => {
    setIsAudioOnly(audioOnly);
    if (providerRef.current) {
      if (audioOnly) {
        await providerRef.current.toggleVideo(false);
        setIsVideoEnabled(false);
      } else {
        await providerRef.current.toggleVideo(true);
        setIsVideoEnabled(true);
        setPreviewStream(providerRef.current.getLocalStream());
      }
    }
  };

  const handleStartBroadcast = async () => {
    if (!currentUserProfile || isStarting) return;
    setIsStarting(true);

    try {
      const stream = await createLiveStream({
        hostUid: currentUserProfile.uid,
        hostName: currentUserProfile.displayName || 'मित्र',
        hostPhotoURL: currentUserProfile.photoURL,
        hostDistrict: currentUserProfile.district || 'महाराष्ट्र',
        title: streamTitle,
        category: selectedCategory,
        isAudioOnly: isAudioOnly,
      });

      let activeProvider = providerRef.current || createMediaProvider();
      try {
        const tokenResp = await fetchLiveToken(
          stream.livekitRoomName,
          currentUserProfile.uid,
          currentUserProfile.displayName || 'यजमान',
          'host'
        );

        if (!tokenResp.isMock && tokenResp.livekitUrl && tokenResp.token) {
          const lk = new LiveKitProvider(tokenResp.livekitUrl);
          await lk.connect(stream.livekitRoomName, tokenResp.token, currentUserProfile.uid);
          await lk.publish({
            video: !isAudioOnly && isVideoEnabled,
            audio: isAudioEnabled,
            facingMode: isFrontCamera ? 'user' : 'environment',
          });
          if (providerRef.current && providerRef.current !== lk) {
            providerRef.current.unpublish().catch(() => {});
          }
          activeProvider = lk;
        } else {
          await activeProvider.connect(stream.livekitRoomName, tokenResp.token, currentUserProfile.uid);
        }
      } catch (tokenErr) {
        console.warn('LiveKit token/connect fallback:', tokenErr);
      }

      onStreamStarted(stream, activeProvider);
    } catch (err: any) {
      console.error('Error starting live stream:', err);
      alert('लाईव्ह सुरू करताना त्रुटी आली: ' + (err.message || 'कृपया पुन्हा प्रयत्न करा'));
      setIsStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-full max-w-md mx-auto h-[100dvh] max-h-[100dvh] bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Background Live Camera Preview / Audio Visualizer */}
      <div className="absolute inset-0 z-0">
        {isAudioOnly ? (
          <AudioOnlyVisualizer
            hostName={currentUserProfile?.displayName || 'मित्र'}
            hostPhotoURL={currentUserProfile?.photoURL}
            hostDistrict={currentUserProfile?.district || 'महाराष्ट्र'}
            title={streamTitle}
            isHostSpeaking={isAudioEnabled}
          />
        ) : (
          <VideoTile
            stream={previewStream}
            participantName={currentUserProfile?.displayName}
            photoURL={currentUserProfile?.photoURL}
            isHost={true}
            isLocal={true}
            mirror={isFrontCamera}
            filter={selectedFilter}
            fit="cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/90 pointer-events-none" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 px-4 pt-3 sm:pt-5 pb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            id="btn-back-from-setup"
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* LiveKit Connection Indicator */}
          {liveKitStatus?.hasLiveKit ? (
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shadow-sm"
              title={`LiveKit Cloud सक्रिय: ${liveKitStatus.details?.maskedUrl || 'SFU Active'}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LiveKit SFU</span>
            </div>
          ) : (
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-white/70 text-[11px] font-medium"
              title="Settings मध्ये LIVEKIT_URL, LIVEKIT_API_KEY व LIVEKIT_API_SECRET कॉन्फिगर करा"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400/80" />
              <span>स्थानिक चाचणी (Test)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isAudioOnly ? (
            <>
              {/* Filters Button */}
              <button
                onClick={() => setShowFilterPicker(true)}
                className={`px-3 h-10 rounded-full backdrop-blur-md border flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                  selectedFilter.id !== 'none'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-300 shadow-md shadow-rose-950/40'
                    : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
                }`}
                title="सौंदर्य व फिल्टर्स (Filters)"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span className="text-xs font-semibold">{selectedFilter.nameMr}</span>
              </button>

              {/* Flip Camera */}
              <button
                onClick={handleFlipCamera}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-all cursor-pointer"
                title="कॅमेरा बदला (Flip Camera)"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>

              {/* Toggle Video */}
              <button
                onClick={handleToggleVideo}
                className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
                  isVideoEnabled ? 'bg-black/40 text-white' : 'bg-rose-600 text-white'
                }`}
                title="कॅमेरा सुरू/बंद"
              >
                {isVideoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <div className="px-3 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 backdrop-blur-md flex items-center gap-1.5 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>ऑडिओ पॉडकास्ट</span>
            </div>
          )}

          {/* Toggle Audio */}
          <button
            onClick={handleToggleAudio}
            className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              isAudioEnabled ? 'bg-black/40 text-white' : 'bg-rose-600 text-white'
            }`}
            title="माईक सुरू/बंद"
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Center Setup Controls (Scrollable on small mobile screens) */}
      <div className="relative z-10 px-4 w-full max-w-md mx-auto flex-1 overflow-y-auto min-h-0 flex flex-col justify-center py-2 space-y-3">
        {/* Mode Selector: Video vs Audio-Only Podcast */}
        <div className="bg-black/70 backdrop-blur-md border border-white/15 rounded-2xl p-1 flex items-center shadow-xl">
          <button
            type="button"
            onClick={() => handleModeChange(false)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              !isAudioOnly
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>व्हिडिओ थेट</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange(true)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isAudioOnly
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>केवळ ऑडिओ (Data Saver)</span>
          </button>
        </div>

        {/* Stream Title Card */}
        <div className="bg-black/60 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 sm:p-4 shadow-2xl">
          <label className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider block mb-1.5">
            थेट प्रवाहाचे शीर्षक (Stream Title)
          </label>
          <input
            type="text"
            value={streamTitle}
            onChange={(e) => setStreamTitle(e.target.value)}
            maxLength={60}
            placeholder="उदा. पुणेकर मित्रांशी गप्पा..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
          />

          {/* District Tag */}
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>स्थान: <strong className="text-white">{currentUserProfile?.district || 'महाराष्ट्र'}</strong></span>
          </div>
        </div>

        {/* Category Selector */}
        <div className="bg-black/60 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-3.5 shadow-2xl">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2 px-1">
            श्रेणी निवडा (Select Category)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/30 border border-rose-400' 
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{cat.labelMr}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Start Broadcast Action */}
      <div 
        className="relative z-10 px-4 pt-2 pb-5 max-w-md mx-auto w-full shrink-0"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={handleStartBroadcast}
          disabled={isStarting || !streamTitle.trim()}
          id="btn-confirm-go-live"
          className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-extrabold text-base shadow-2xl shadow-rose-600/40 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isStarting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>लाईव्ह सुरू होत आहे...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span>थेट प्रक्षेपण सुरू करा (Start Live)</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Picker Sheet */}
      <FilterPickerSheet
        isOpen={showFilterPicker}
        selectedFilter={selectedFilter}
        onSelectFilter={(f) => {
          setSelectedFilter(f);
          setShowFilterPicker(false);
        }}
        onClose={() => setShowFilterPicker(false)}
      />
    </div>
  );
};
