import React from 'react';
import { VideoTile } from './VideoTile';
import { StageGuest } from '../services/stageService';
import { LiveStream } from '../services/streamService';
import { LiveFilter } from '../config/filters';
import { User, MicOff, Volume2, VolumeX, LogOut, UserPlus, X, ShieldAlert } from 'lucide-react';

interface MultiGuestGridProps {
  stream: LiveStream | null;
  hostStream: MediaStream | null;
  stageGuests: StageGuest[];
  currentUserId?: string;
  isHost?: boolean;
  isFrontCamera?: boolean;
  filter?: LiveFilter;
  onMuteGuest?: (guestId: string, isMuted: boolean) => void;
  onKickGuest?: (guestId: string, name: string) => void;
  onLeaveStage?: () => void;
  onRequestJoinStage?: () => void;
}

export const MultiGuestGrid: React.FC<MultiGuestGridProps> = ({
  stream,
  hostStream,
  stageGuests,
  currentUserId,
  isHost = false,
  isFrontCamera = true,
  filter,
  onMuteGuest,
  onKickGuest,
  onLeaveStage,
  onRequestJoinStage,
}) => {
  const totalOnStage = 1 + stageGuests.length;

  // Solo mode: Full screen host video
  if (totalOnStage === 1) {
    return (
      <div className="relative w-full h-full">
        <VideoTile
          stream={hostStream}
          participantName={stream?.hostName || 'यजमान (Host)'}
          photoURL={stream?.hostPhotoURL}
          isHost={true}
          isLocal={isHost}
          mirror={isHost && isFrontCamera}
          filter={filter}
          fit="cover"
        />
      </div>
    );
  }

  // 2 People (Host + 1 Guest): 50/50 Split (Top/Bottom or Left/Right)
  if (totalOnStage === 2) {
    const guest1 = stageGuests[0];
    const isCurrentUserGuest = guest1?.userId === currentUserId;

    return (
      <div className="w-full h-full flex flex-col md:flex-row gap-1 bg-slate-950 p-1">
        {/* Host Tile */}
        <div className="relative flex-1 rounded-2xl overflow-hidden border border-rose-500/30">
          <VideoTile
            stream={hostStream}
            participantName={stream?.hostName || 'यजमान'}
            photoURL={stream?.hostPhotoURL}
            isHost={true}
            isLocal={isHost}
            mirror={isHost && isFrontCamera}
            badgeText="यजमान (Host)"
            filter={filter}
            fit="cover"
          />
        </div>

        {/* Guest 1 Tile */}
        <div className="relative flex-1 rounded-2xl overflow-hidden border border-sky-500/30 bg-slate-900">
          <VideoTile
            stream={isCurrentUserGuest ? hostStream : null}
            participantName={guest1.name}
            photoURL={guest1.photoURL}
            isHost={false}
            isLocal={isCurrentUserGuest}
            isMuted={guest1.isMuted}
            badgeText={guest1.district ? `अतिथी • ${guest1.district}` : 'अतिथी (Guest)'}
            fit="cover"
          />

          {/* Action Overlay for Guest or Host */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
            {isHost && (
              <>
                <button
                  onClick={() => onMuteGuest?.(guest1.userId, !guest1.isMuted)}
                  className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                    guest1.isMuted ? 'bg-rose-600 text-white' : 'bg-black/60 text-white/80 hover:text-white'
                  }`}
                  title={guest1.isMuted ? 'अनम्यूट करा' : 'म्यूट करा'}
                >
                  {guest1.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => onKickGuest?.(guest1.userId, guest1.name)}
                  className="p-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition-all cursor-pointer"
                  title="मंचावरून काढा (Remove)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {isCurrentUserGuest && (
              <button
                onClick={onLeaveStage}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>मंच सोडा</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3 or 4 People: Responsive 2x2 Grid
  const slots = [
    { type: 'host', data: null },
    ...stageGuests.map((g) => ({ type: 'guest', data: g })),
  ];

  // Fill up to 4 slots if less
  while (slots.length < 4) {
    slots.push({ type: 'empty', data: null as any });
  }

  return (
    <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1.5 bg-slate-950 p-1.5">
      {slots.map((slot, index) => {
        if (slot.type === 'host') {
          return (
            <div key="slot-host" className="relative rounded-2xl overflow-hidden border border-rose-500/40">
              <VideoTile
                stream={hostStream}
                participantName={stream?.hostName || 'यजमान'}
                photoURL={stream?.hostPhotoURL}
                isHost={true}
                isLocal={isHost}
                mirror={isHost && isFrontCamera}
                badgeText="यजमान (Host)"
                filter={filter}
                fit="cover"
              />
            </div>
          );
        }

        if (slot.type === 'guest' && slot.data) {
          const guest = slot.data;
          const isCurrentUserGuest = guest.userId === currentUserId;

          return (
            <div key={guest.userId} className="relative rounded-2xl overflow-hidden border border-sky-500/30 bg-slate-900">
              <VideoTile
                stream={isCurrentUserGuest ? hostStream : null}
                participantName={guest.name}
                photoURL={guest.photoURL}
                isHost={false}
                isLocal={isCurrentUserGuest}
                isMuted={guest.isMuted}
                badgeText={guest.district ? `अतिथी • ${guest.district}` : 'अतिथी'}
                fit="cover"
              />

              {/* Host and Guest Controls */}
              <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                {isHost && (
                  <>
                    <button
                      onClick={() => onMuteGuest?.(guest.userId, !guest.isMuted)}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                        guest.isMuted ? 'bg-rose-600 text-white' : 'bg-black/60 text-white/80 hover:text-white'
                      }`}
                      title={guest.isMuted ? 'अनम्यूट करा' : 'म्यूट करा'}
                    >
                      {guest.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onKickGuest?.(guest.userId, guest.name)}
                      className="p-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition-all cursor-pointer"
                      title="मंचावरून काढा"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {isCurrentUserGuest && (
                  <button
                    onClick={onLeaveStage}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-all cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>सोडा</span>
                  </button>
                )}
              </div>
            </div>
          );
        }

        // Empty Slot
        return (
          <div
            key={`slot-empty-${index}`}
            onClick={!isHost ? onRequestJoinStage : undefined}
            className={`relative rounded-2xl border border-dashed border-white/10 bg-slate-900/40 flex flex-col items-center justify-center p-3 text-center transition-all ${
              !isHost ? 'hover:border-rose-500/40 hover:bg-rose-500/5 cursor-pointer' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-1.5">
              <UserPlus className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              मंच उपलब्ध (Slot {index})
            </span>
            {!isHost && (
              <span className="text-[10px] text-rose-400 font-semibold mt-1">
                सामील होण्यासाठी टॅप करा
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
