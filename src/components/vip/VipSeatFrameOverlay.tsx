import React from 'react';
import { InnovativeFrame } from './InnovativeFrame';
import { InnovativeFrameStyle, findInnovativeFrameById } from '../../data/innovativeFramesData';

interface VipSeatFrameOverlayProps {
  vipLevel: number;
  frameId?: string;
  isSpeaking?: boolean;
  style?: InnovativeFrameStyle;
}

export const VipSeatFrameOverlay: React.FC<VipSeatFrameOverlayProps> = ({
  vipLevel,
  frameId,
  isSpeaking = false,
  style
}) => {
  // Check if frameId maps to an innovative frame
  const found = frameId ? findInnovativeFrameById(frameId) : null;
  const activeLevel = found ? found.tier.vipLevel : vipLevel;
  const activeStyle: InnovativeFrameStyle = style || (found ? found.style : 'fusion');

  if (!activeLevel || activeLevel <= 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-15 flex items-center justify-center">
      <InnovativeFrame
        vipLevel={activeLevel}
        frameId={frameId}
        style={activeStyle}
        isSpeaking={isSpeaking}
        size="seat"
        overlayOnly={true}
        showBadge={true}
        showCrest={true}
      />
    </div>
  );
};

