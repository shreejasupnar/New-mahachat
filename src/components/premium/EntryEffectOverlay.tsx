import React, { useEffect, useState, useRef } from 'react';
import { RoomEntryEvent } from '../../premium/types';
import { getEntryEffectById } from '../../premium';

interface EntryEffectOverlayProps {
  entryEvent?: RoomEntryEvent | null;
  event?: RoomEntryEvent | null;
  onDismiss: () => void;
  durationMs?: number;
}

export const EntryEffectOverlay: React.FC<EntryEffectOverlayProps> = ({
  entryEvent,
  event,
  onDismiss,
  durationMs = 2700
}) => {
  const activeEvent = entryEvent || event;
  const [visible, setVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (activeEvent) {
      setVisible(true);
      setIsExiting(false);

      // Strictly enforce 2.5s to 3.0s duration (default 2700ms)
      const effectiveDuration = Math.min(Math.max(durationMs, 2500), 3000);

      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, Math.max(200, effectiveDuration - 350));

      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismissRef.current) {
          onDismissRef.current();
        }
      }, effectiveDuration);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(timer);
      };
    } else {
      setVisible(false);
      setIsExiting(false);
    }
  }, [activeEvent, durationMs]);

  if (!activeEvent || !visible) return null;

  const effectData = getEntryEffectById(activeEvent.effectId);
  const bannerGradient = effectData?.bannerGradient || 'from-amber-600 via-orange-600 to-amber-700';
  const bannerText = effectData?.bannerTextMr || 'रूममध्ये स्वागत!';
  const icon = effectData?.icon || '🚩';

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-[90%] max-w-sm transition-all duration-300 ${
      isExiting ? 'opacity-0 -translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-2 duration-300'
    }`}>
      <div className={`bg-gradient-to-r ${bannerGradient} text-white px-4 py-2.5 rounded-2xl shadow-xl border border-yellow-200/50 flex items-center gap-3 backdrop-blur-xs`}>
        <div className="text-2xl shrink-0 animate-pulse">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-black tracking-wide text-yellow-200 truncate">
            {activeEvent.userName} चे आगमन!
          </div>
          <div className="text-[10px] text-white/95 truncate font-medium">
            {bannerText}
          </div>
        </div>
      </div>
    </div>
  );
};
