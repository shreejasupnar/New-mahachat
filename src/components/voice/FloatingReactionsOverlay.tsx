import React from 'react';

export interface FloatingReaction {
  id: string;
  emoji: string;
  leftPercent: number;
}

interface FloatingReactionsOverlayProps {
  reactions: FloatingReaction[];
}

export const FloatingReactionsOverlay: React.FC<FloatingReactionsOverlayProps> = ({
  reactions
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-20 text-2xl sm:text-3xl animate-bounce"
          style={{
            left: `${r.leftPercent}%`,
            animation: 'floatUp 3s ease-out forwards'
          }}
        >
          {r.emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.8);
          }
          50% {
            opacity: 0.9;
            transform: translateY(-200px) scale(1.2) rotate(15deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-420px) scale(1.4) rotate(-15deg);
          }
        }
      `}</style>
    </div>
  );
};
