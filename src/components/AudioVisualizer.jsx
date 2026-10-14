import React, { useEffect, useRef } from 'react';
import { useTheme, THEMES } from '../context/ThemeContext';

export default function AudioVisualizer({ analyserNode, isPlaying = false, height = 120, barsCount = 48 }) {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Determine colors based on current theme
    const getColors = () => {
      if (theme === THEMES.IVORY) {
        return {
          barA: '#BFA15F',
          barB: '#8E7756',
          wave: '#AD9674',
          glow: 'rgba(191, 161, 95, 0.4)'
        };
      } else if (theme === THEMES.GOLD) {
        return {
          barA: '#E5B842',
          barB: '#D4AF37',
          wave: '#F3C766',
          glow: 'rgba(229, 184, 66, 0.6)'
        };
      } else {
        return {
          barA: '#D4AF37',
          barB: '#48CAE4',
          wave: '#38BDF8',
          glow: 'rgba(56, 189, 248, 0.4)'
        };
      }
    };

    const colors = getColors();
    const dataArray = analyserNode ? new Uint8Array(analyserNode.frequencyBinCount) : null;
    let idlePhase = 0;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      idlePhase += 0.04;

      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(dataArray);

        const barWidth = (width / barsCount) * 0.75;
        const gap = (width / barsCount) * 0.25;

        for (let i = 0; i < barsCount; i++) {
          const sampleIndex = Math.floor((i / barsCount) * (dataArray.length * 0.5));
          const value = dataArray[sampleIndex] || 0;
          const percent = value / 255;
          const barHeight = Math.max(percent * (h * 0.85), 4);

          const x = i * (barWidth + gap) + gap / 2;
          const y = h - barHeight;

          // Gradient bar
          const grad = ctx.createLinearGradient(0, y, 0, h);
          grad.addColorStop(0, colors.barA);
          grad.addColorStop(1, colors.barB);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Cap highlight
          ctx.fillStyle = colors.wave;
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y, barWidth / 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Idle gentle breathing sine wave
        const barWidth = (width / barsCount) * 0.75;
        const gap = (width / barsCount) * 0.25;

        for (let i = 0; i < barsCount; i++) {
          const waveHeight = (Math.sin(idlePhase + i * 0.25) * 0.5 + 0.5) * (h * 0.35) + 6;
          const x = i * (barWidth + gap) + gap / 2;
          const y = h - waveHeight;

          ctx.fillStyle = colors.glow;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, waveHeight, [3, 3, 0, 0]);
          ctx.fill();
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyserNode, isPlaying, theme, barsCount]);

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-theme-bg/60 border border-theme-border/70 p-3 shadow-inner">
      <div className="flex items-center justify-between text-[11px] font-mono text-theme-muted mb-2 px-1">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-theme-muted'}`} />
          {isPlaying ? 'LIVE 48kHz STEREO' : 'AUDIO READY'}
        </span>
        <span>SPECTRUM ANALYZER</span>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full h-auto block rounded-lg"
      />
    </div>
  );
}
