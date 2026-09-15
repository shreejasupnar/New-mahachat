import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { celebrationAudio } from '../../lib/celebrationAudio';
import confetti from 'canvas-confetti';

export interface GiftFlightRequest {
  id: string;
  giftIcon: string;
  giftName: string;
  multiplier: number;
  recipientUid?: string;
  recipientName?: string;
  senderUid?: string;
  targetSeatIndex?: number;
  isBroadcast?: boolean;
}

type FlightListener = (flight: GiftFlightRequest) => void;

class SeatGiftFlightManager {
  private listeners: FlightListener[] = [];

  subscribe(listener: FlightListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  triggerFlight(request: Omit<GiftFlightRequest, 'id'>) {
    const fullRequest: GiftFlightRequest = {
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    };
    this.listeners.forEach(l => l(fullRequest));
  }
}

export const seatGiftFlightManager = new SeatGiftFlightManager();

interface ActiveFlightItem {
  id: string;
  giftIcon: string;
  giftName: string;
  multiplier: number;
  startX: number;
  startY: number;
  targets: Array<{
    id: string;
    x: number;
    y: number;
    recipientName: string;
    seatIdx?: number;
  }>;
}

interface LandingImpact {
  id: string;
  x: number;
  y: number;
  giftIcon: string;
  multiplier: number;
  recipientName: string;
}

export const SeatGiftFlightAnimation: React.FC = () => {
  const [flights, setFlights] = useState<ActiveFlightItem[]>([]);
  const [impacts, setImpacts] = useState<LandingImpact[]>([]);

  useEffect(() => {
    const unsub = seatGiftFlightManager.subscribe((req) => {
      // 1. Calculate start position
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight - 70;

      if (req.senderUid) {
        const senderEl = document.querySelector(`[data-user-id="${req.senderUid}"]`);
        if (senderEl) {
          const rect = senderEl.getBoundingClientRect();
          startX = rect.left + rect.width / 2;
          startY = rect.top + rect.height / 2;
        }
      }

      // 2. Calculate target positions
      const targets: ActiveFlightItem['targets'] = [];

      if (req.isBroadcast) {
        // Find all occupied seats
        const occupiedSeats = document.querySelectorAll('[id^="voice-stage-seat-"][data-user-id]');
        if (occupiedSeats.length > 0) {
          occupiedSeats.forEach((el, idx) => {
            const rect = el.getBoundingClientRect();
            targets.push({
              id: `${req.id}-bcast-${idx}`,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              recipientName: 'सर्व सदस्य'
            });
          });
        } else {
          // Fallback to center stage podium
          const centerEl = document.getElementById('voice-stage-center-podium');
          if (centerEl) {
            const rect = centerEl.getBoundingClientRect();
            targets.push({
              id: `${req.id}-bcast-center`,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              recipientName: 'कट्टा'
            });
          }
        }
      } else {
        // Specific recipient seat
        let targetEl: HTMLElement | null = null;

        // Try by data-user-id first
        if (req.recipientUid) {
          targetEl = document.querySelector(`[data-user-id="${req.recipientUid}"]`) as HTMLElement;
        }

        // Try by targetSeatIndex
        if (!targetEl && req.targetSeatIndex !== undefined && req.targetSeatIndex >= 0) {
          targetEl = (document.getElementById(`voice-stage-seat-${req.targetSeatIndex}`) ||
            document.getElementById(`voice-host-seat-${req.targetSeatIndex}`)) as HTMLElement;
        }

        // Fallback to center podium or top area
        if (!targetEl) {
          targetEl = document.getElementById('voice-stage-center-podium') as HTMLElement;
        }

        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          targets.push({
            id: `${req.id}-target-0`,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            recipientName: req.recipientName || 'सदस्य',
            seatIdx: req.targetSeatIndex
          });
        } else {
          targets.push({
            id: `${req.id}-target-center`,
            x: window.innerWidth / 2,
            y: window.innerHeight * 0.35,
            recipientName: req.recipientName || 'सदस्य'
          });
        }
      }

      if (targets.length === 0) return;

      const flightItem: ActiveFlightItem = {
        id: req.id,
        giftIcon: req.giftIcon,
        giftName: req.giftName,
        multiplier: req.multiplier,
        startX,
        startY,
        targets
      };

      setFlights((prev) => [...prev, flightItem]);

      // Schedule landing impacts at t = 750ms
      setTimeout(() => {
        targets.forEach((tgt) => {
          const impactItem: LandingImpact = {
            id: `${flightItem.id}-${tgt.id}`,
            x: tgt.x,
            y: tgt.y,
            giftIcon: flightItem.giftIcon,
            multiplier: flightItem.multiplier,
            recipientName: tgt.recipientName
          };

          setImpacts((prev) => [...prev, impactItem]);

          // Small sparkle burst at seat position
          try {
            confetti({
              particleCount: Math.min(25 * Math.min(flightItem.multiplier, 4), 60),
              spread: 60,
              origin: {
                x: Math.max(0.1, Math.min(0.9, tgt.x / window.innerWidth)),
                y: Math.max(0.1, Math.min(0.9, tgt.y / window.innerHeight))
              },
              colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
              ticks: 60,
              shapes: ['circle', 'star']
            });
          } catch {}

          // Play arrival audio
          celebrationAudio.playGiftSentSound();

          // Remove impact after 1600ms
          setTimeout(() => {
            setImpacts((prev) => prev.filter((im) => im.id !== impactItem.id));
          }, 1600);
        });

        // Remove flight item from flights
        setFlights((prev) => prev.filter((fl) => fl.id !== flightItem.id));
      }, 750);
    });

    return unsub;
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none">
      {/* 1. FLYING GIFTS (From Sender/Bottom -> Recipient Seat) */}
      <AnimatePresence>
        {flights.map((flight) => {
          return flight.targets.map((tgt, tgtIdx) => {
            // Calculate midpoint with upward arc
            const dx = tgt.x - flight.startX;
            const dy = tgt.y - flight.startY;
            const midX = flight.startX + dx * 0.5 + (tgtIdx % 2 === 0 ? -30 : 30);
            const midY = Math.min(flight.startY, tgt.y) - 60 - Math.min(Math.abs(dx) * 0.15, 80);

            // Stagger particles for combos (e.g. 1 to 3 items flying)
            const count = flight.multiplier >= 10 ? 3 : flight.multiplier > 1 ? 2 : 1;

            return Array.from({ length: count }).map((_, pIdx) => (
              <motion.div
                key={`${flight.id}-${tgt.id}-p-${pIdx}`}
                initial={{
                  x: flight.startX,
                  y: flight.startY,
                  scale: 0.3,
                  opacity: 0,
                  rotate: -20
                }}
                animate={{
                  x: [flight.startX, midX, tgt.x],
                  y: [flight.startY, midY, tgt.y],
                  scale: [0.4, 1.4, 1.0],
                  opacity: [0, 1, 1],
                  rotate: [-20, 15, 0]
                }}
                transition={{
                  duration: 0.75,
                  delay: pIdx * 0.08,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
              >
                <div className="relative flex flex-col items-center">
                  {/* Glowing energy tail / aura */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 blur-md opacity-80 scale-125 animate-pulse" />
                  
                  {/* Gift Emoji / Icon */}
                  <div className="text-3xl sm:text-4xl filter drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] relative z-10 animate-bounce">
                    {flight.giftIcon}
                  </div>

                  {/* Multiplier tag trailing */}
                  {flight.multiplier > 1 && pIdx === 0 && (
                    <div className="relative z-10 -mt-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-pink-600 to-amber-500 text-white font-black text-[9px] shadow-md border border-yellow-200">
                      x{flight.multiplier}
                    </div>
                  )}
                </div>
              </motion.div>
            ));
          });
        })}
      </AnimatePresence>

      {/* 2. SEAT IMPACT & COMBO REACTION (At the target seat coordinates) */}
      <AnimatePresence>
        {impacts.map((impact) => (
          <motion.div
            key={impact.id}
            initial={{ opacity: 0, scale: 0.4, y: 0 }}
            animate={{ opacity: 1, scale: [0.6, 1.25, 1], y: -25 }}
            exit={{ opacity: 0, scale: 0.8, y: -45 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{
              left: `${impact.x}px`,
              top: `${impact.y}px`
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center"
          >
            {/* Pulsing Shockwave Ripple */}
            <div className="absolute w-20 h-20 -top-6 rounded-full border-2 border-yellow-400/80 bg-yellow-400/20 blur-xs animate-ping" />
            
            {/* Sparkle burst icon */}
            <div className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,215,0,0.95)] animate-spin-slow">
              ✨
            </div>

            {/* Floating Multiplier / Gift Tag on Seat */}
            <div className="mt-0.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 text-white font-black text-xs shadow-[0_4px_16px_rgba(236,72,153,0.6)] border-2 border-yellow-400 flex items-center gap-1.5 backdrop-blur-md">
              <span className="text-base">{impact.giftIcon}</span>
              <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-pink-300 bg-clip-text text-transparent text-sm">
                x{impact.multiplier}
              </span>
              <span className="text-[10px] text-yellow-300/90 font-medium truncate max-w-[80px]">
                {impact.recipientName}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
