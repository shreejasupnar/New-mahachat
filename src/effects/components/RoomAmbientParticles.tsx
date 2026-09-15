import React, { useEffect, useRef, useState } from 'react';
import { effectsSettings } from '../settings/EffectsSettingsManager';

interface RoomAmbientParticlesProps {
  type?: 'fireflies' | 'leaves' | 'rain' | 'gold_dust' | 'stars' | 'petals' | 'none';
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export const RoomAmbientParticles: React.FC<RoomAmbientParticlesProps> = ({ type = 'fireflies' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const unsub = effectsSettings.subscribe(settings => {
      setEnabled(settings.effectsEnabled && settings.ambientParticlesEnabled);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!enabled || type === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate lightweight pool of particles (18-28 max for high fps)
    const particleCount = type === 'rain' ? 35 : 20;
    const particles: Particle[] = [];

    const getColors = () => {
      switch (type) {
        case 'fireflies':
          return ['#fef08a', '#facc15', '#a3e635'];
        case 'leaves':
          return ['#84cc16', '#65a30d', '#ca8a04', '#15803d'];
        case 'rain':
          return ['#38bdf8', '#7dd3fc', '#bae6fd'];
        case 'gold_dust':
          return ['#fbbf24', '#f59e0b', '#ffd700'];
        case 'stars':
          return ['#ffffff', '#e0f2fe', '#fef9c3'];
        case 'petals':
        default:
          return ['#fb7185', '#f43f5e', '#fda4af', '#f472b6'];
      }
    };

    const colors = getColors();

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: type === 'rain' ? Math.random() * 2 + 1 : Math.random() * 3 + 2,
        speedX: type === 'rain' ? 0.3 : (Math.random() - 0.5) * 0.6,
        speedY: type === 'rain' ? Math.random() * 3 + 3 : Math.random() * 0.4 + 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX * (delta * 60);
        p.y += p.speedY * (delta * 60);
        p.rotation += p.rotationSpeed;

        // Wrap around boundaries
        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (type === 'fireflies') {
          // Soft pulsing glow
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === 'rain') {
          // Slanted rain drop
          ctx.fillRect(0, 0, 1.2, p.size * 3);
        } else if (type === 'leaves') {
          // Elliptical leaf shape
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Star / dust spark
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type, enabled]);

  if (!enabled || type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70"
    />
  );
};
