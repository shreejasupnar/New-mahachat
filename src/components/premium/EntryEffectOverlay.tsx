import React, { useEffect, useState } from 'react';
import { RoomEntryEvent } from '../../premium/types';
import { getEntryEffectById } from '../../premium';

interface EntryEffectOverlayProps {
  entryEvent: RoomEntryEvent | null;
  onDismiss: () => void;
}

export const EntryEffectOverlay: React.FC<EntryEffectOverlayProps> = ({
  entryEvent,
  onDismiss
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (entryEvent) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 3800);
      return () => clearTimeout(timer);
    }
  }, [entryEvent, onDismiss]);

  if (!entryEvent || !visible) return null;

  const effectData = getEntryEffectById(entryEvent.effectId);
  const bannerGradient = effectData?.bannerGradient || 'from-amber-600 via-orange-600 to-amber-700';
  const bannerText = effectData?.bannerTextMr || 'रूममध्ये स्वागत!';
  const icon = effectData?.icon || '🚩';

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-[90%] max-w-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className={`bg-gradient-to-r ${bannerGradient} text-white px-4 py-2.5 rounded-2xl shadow-xl border border-yellow-200/50 flex items-center gap-3 backdrop-blur-xs`}>
        <div className="text-2xl shrink-0 animate-pulse">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-black tracking-wide text-yellow-200 truncate">
            {entryEvent.userName} चे आगमन!
          </div>
          <div className="text-[10px] text-white/95 truncate font-medium">
            {bannerText}
          </div>
        </div>
      </div>
    </div>
  );
};
