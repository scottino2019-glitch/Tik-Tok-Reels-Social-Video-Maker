import React, { useRef, useEffect, useState } from 'react';
import { Project } from '../types';
import { canvasRenderer } from '../utils/canvasRenderer';
import { audioEngine } from '../utils/audioEngine';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Maximize2,
  Repeat
} from 'lucide-react';

interface PreviewPlayerProps {
  project: Project;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isMuted: boolean;
  toggleMute: () => void;
  activeSceneIndex: number;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({
  project,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  isMuted,
  toggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showPhoneFrame, setShowPhoneFrame] = useState(true);
  const [isLooping, setIsLooping] = useState(true);

  const totalDuration = canvasRenderer.getTotalDuration(project.scenes);

  const lastTimeRef = useRef<number>(0);

  // High FPS render loop
  useEffect(() => {
    let animId: number;
    let lastTimestamp: number | null = null;

    const render = (timestamp: number) => {
      const prevTime = lastTimeRef.current;

      if (lastTimestamp !== null && isPlaying) {
        const delta = (timestamp - lastTimestamp) / 1000;
        setCurrentTime((prev) => {
          let next = prev + delta;
          if (next >= totalDuration) {
            if (isLooping) {
              next = 0;
            } else {
              setIsPlaying(false);
              next = totalDuration;
            }
          }
          return next;
        });
      }
      lastTimestamp = timestamp;

      // Draw canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dims = canvasRenderer.getCanvasDimensions(project.aspectRatio);
          if (canvas.width !== dims.width || canvas.height !== dims.height) {
            canvas.width = dims.width;
            canvas.height = dims.height;
          }
          canvasRenderer.renderFrame(ctx, project, currentTime, dims.width, dims.height);
        }
      }

      // Sync Audio Tracks and Timeline Sound Effects
      if (isPlaying) {
        project.audioTracks.forEach((track) => {
          audioEngine.playAudioTrackAt(track, currentTime, isPlaying);
        });
        audioEngine.playTimelineSoundEffects(project.soundEffects, currentTime, prevTime, isPlaying);
      } else {
        audioEngine.stopAll();
      }

      lastTimeRef.current = currentTime;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentTime, project, totalDuration, isLooping, setCurrentTime, setIsPlaying]);

  // Handle Playback toggle
  const togglePlay = () => {
    audioEngine.resumeContext();
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
  };

  const stepTime = (amount: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(totalDuration, prev + amount)));
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  // Format time (00:02.5)
  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = (timeInSec % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  // Calculate container aspect ratio styling
  const getAspectRatioClass = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[580px]';
      case '1:1':
        return 'aspect-square max-h-[480px]';
      case '4:5':
        return 'aspect-[4/5] max-h-[520px]';
      case '16:9':
        return 'aspect-[16/9] max-w-full max-h-[380px]';
      default:
        return 'aspect-[9/16] max-h-[580px]';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-[#1E293B] p-5 rounded-2xl border border-slate-700 shadow-2xl relative w-full">
      {/* Phone / Canvas Container */}
      <div
        ref={containerRef}
        className={`relative flex items-center justify-center transition-all duration-300 ${getAspectRatioClass()} ${
          showPhoneFrame && project.aspectRatio === '9:16'
            ? 'p-2 bg-slate-950 rounded-[38px] border-[10px] border-slate-800 shadow-2xl shadow-violet-500/10'
            : 'rounded-2xl overflow-hidden border border-slate-700'
        }`}
      >
        {/* Phone Notch (if enabled) */}
        {showPhoneFrame && project.aspectRatio === '9:16' && (
          <div className="absolute top-3 z-30 w-28 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-2 border border-slate-800">
            <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ring-1 ring-slate-800"></div>
            <div className="w-10 h-1 bg-slate-950 rounded-full"></div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain rounded-xl bg-slate-950 shadow-inner"
        />

        {/* Overlay Play Button when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl shadow-black/50 hover:scale-110 active:scale-95 transition-transform cursor-pointer z-20"
          >
            <Play className="w-8 h-8 fill-current translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Scrub & Control Bar */}
      <div className="w-full max-w-md mt-4 space-y-3">
        {/* Progress Slider */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="text-pink-400 font-bold">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={totalDuration || 1}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-pink-500 bg-slate-900 h-1.5 rounded-full appearance-none cursor-pointer"
          />
          <span>{formatTime(totalDuration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowPhoneFrame(!showPhoneFrame)}
              className={`p-2 rounded-xl border text-xs transition-all ${
                showPhoneFrame ? 'bg-slate-800 text-pink-400 border-pink-500/40 shadow-sm' : 'text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
              title="Toggle Cornice Smartphone"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-xl border text-xs transition-all ${
                isLooping ? 'bg-slate-800 text-cyan-400 border-cyan-500/40 shadow-sm' : 'text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
              title={isLooping ? 'Riproduzione in Loop Attiva' : 'Riproduzione Singola'}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => stepTime(-1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="-1 Secondo"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-500/25 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'PAUSA' : 'PLAY'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Ricomincia da Capo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => stepTime(1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="+1 Secondo"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl border text-xs transition-all ${
                isMuted ? 'text-rose-400 border-rose-500/40 bg-rose-500/20' : 'text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors"
              title="Schermo Intero"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
