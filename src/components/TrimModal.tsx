import React, { useState, useRef, useEffect } from 'react';
import { Scene } from '../types';
import { Scissors, Play, Pause, Check, X, Clock, RefreshCw } from 'lucide-react';

interface TrimModalProps {
  scene: Scene;
  sceneIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (sceneIndex: number, newDuration: number, startTime: number, endTime: number) => void;
}

export const TrimModal: React.FC<TrimModalProps> = ({
  scene,
  sceneIndex,
  isOpen,
  onClose,
  onSave,
}) => {
  const [startTime, setStartTime] = useState(scene.startTime || 0);
  const [endTime, setEndTime] = useState(scene.endTime || scene.duration || 5.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(scene.startTime || 0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const totalDuration = scene.mediaDuration || 15.0;

  useEffect(() => {
    if (isOpen) {
      setStartTime(scene.startTime || 0);
      setEndTime(scene.endTime || (scene.startTime || 0) + scene.duration);
      setPreviewTime(scene.startTime || 0);
    }
  }, [isOpen, scene]);

  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const interval = setInterval(() => {
        setPreviewTime((prev) => {
          let next = prev + 0.05;
          if (next >= endTime) {
            next = startTime;
          }
          if (videoRef.current) {
            videoRef.current.currentTime = next;
          }
          return next;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isPlaying, startTime, endTime]);

  if (!isOpen) return null;

  const currentTrimLength = Math.max(0.1, endTime - startTime);

  const handleApply = () => {
    onSave(sceneIndex, currentTrimLength, startTime, endTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-tight">Strumento Taglio Preciso</h3>
              <p className="text-xs text-slate-400">Imposta tempo di inizio e fine con precisione al millisecondo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview Player */}
        <div className="relative aspect-video max-h-64 bg-[#1E293B] rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center">
          {scene.mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={scene.mediaUrl}
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={scene.mediaUrl}
              alt="Media Scena"
              className="w-full h-full object-contain"
            />
          )}

          {/* Time Badge */}
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold text-pink-400 border border-slate-700 shadow">
            {previewTime.toFixed(2)}s / {endTime.toFixed(2)}s
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-violet-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
          </button>
        </div>

        {/* Trimming Range Controls */}
        <div className="space-y-4 bg-[#1E293B] p-4 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 font-bold">
            <span className="flex items-center gap-1.5 text-pink-400">
              <Clock className="w-4 h-4" /> Inizio: {startTime.toFixed(2)}s
            </span>
            <span className="text-cyan-400">
              Durata Risultante: {currentTrimLength.toFixed(2)}s
            </span>
            <span className="flex items-center gap-1.5 text-violet-400">
              <Clock className="w-4 h-4" /> Fine: {endTime.toFixed(2)}s
            </span>
          </div>

          {/* Dual Range Trimming Slider */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-bold mb-1">
                <span>Punto Inizio (In)</span>
                <span>{startTime.toFixed(2)}s</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(0.1, endTime - 0.1)}
                step={0.01}
                value={startTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setStartTime(val);
                  setPreviewTime(val);
                }}
                className="w-full accent-pink-500 bg-slate-800 h-2 rounded-full cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 font-bold mb-1">
                <span>Punto Fine (Out)</span>
                <span>{endTime.toFixed(2)}s</span>
              </div>
              <input
                type="range"
                min={startTime + 0.1}
                max={totalDuration}
                step={0.01}
                value={endTime}
                onChange={(e) => setEndTime(parseFloat(e.target.value))}
                className="w-full accent-violet-500 bg-slate-800 h-2 rounded-full cursor-pointer"
              />
            </div>
          </div>

          {/* Nudge Buttons for High Precision */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Regola Inizio:</span>
              <button
                onClick={() => setStartTime((s) => Math.max(0, s - 0.05))}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 font-mono"
              >
                -0.05s
              </button>
              <button
                onClick={() => setStartTime((s) => Math.min(endTime - 0.1, s + 0.05))}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 font-mono"
              >
                +0.05s
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Regola Fine:</span>
              <button
                onClick={() => setEndTime((e) => Math.max(startTime + 0.1, e - 0.05))}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 font-mono"
              >
                -0.05s
              </button>
              <button
                onClick={() => setEndTime((e) => Math.min(totalDuration, e + 0.05))}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 font-mono"
              >
                +0.05s
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Annulla
          </button>

          <button
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Applica Taglio ({currentTrimLength.toFixed(1)}s)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
