import React, { useState, useEffect } from 'react';

interface FloatingHeart {
  id: number;
  x: number;
  color: string;
  emoji: string;
}

interface FloatingLikesProps {
  triggerCount: number;
}

const COLORS = ['#f43f5e', '#ec4899', '#f59e0b', '#8b5cf6', '#10b981'];
const EMOJIS = ['❤️', '💖', '🔥', '🌸', '✨', '👏'];

export const FloatingLikes: React.FC<FloatingLikesProps> = ({ triggerCount }) => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    if (triggerCount <= 0) return;

    const id = Date.now() + Math.random();
    const newHeart: FloatingHeart = {
      id,
      x: Math.floor(Math.random() * 40) - 20, // drift left or right
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    };

    setHearts((prev) => [...prev.slice(-15), newHeart]);

    const timer = setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1800);

    return () => clearTimeout(timer);
  }, [triggerCount]);

  return (
    <div className="absolute bottom-20 right-4 w-16 h-64 pointer-events-none overflow-hidden z-20 flex flex-col justify-end items-center">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute text-xl animate-float-up opacity-90 drop-shadow-md select-none"
          style={{
            transform: `translateX(${h.x}px)`,
            animationDuration: '1.8s',
          }}
        >
          {h.emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(0.8) rotate(0deg);
          }
          50% {
            transform: translateY(-80px) scale(1.2) rotate(15deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-180px) scale(1) rotate(-15deg);
          }
        }
        .animate-float-up {
          animation: floatUp 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};
