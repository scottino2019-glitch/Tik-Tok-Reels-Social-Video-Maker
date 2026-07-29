import React, { useState } from 'react';
import { Project, ExportSettings } from '../types';
import { videoExporter, ExportProgress } from '../utils/videoExporter';
import { Download, X, Film, Check, Loader2, Sparkles, Video, Share2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'mp4',
    resolution: '1080p',
    fps: 30,
    quality: 'high',
  });

  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    try {
      await videoExporter.exportVideo(project, settings, (p) => {
        setProgress(p);
      });
    } catch {
      // Error handled in callback
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-tight">Esporta Video per i Social</h3>
              <p className="text-xs text-slate-400">Genera il file video ottimizzato per TikTok, Instagram Reels e Facebook</p>
            </div>
          </div>

          {!isExporting && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress or Settings view */}
        {progress && progress.status !== 'error' ? (
          <div className="space-y-5 py-4 text-center">
            {progress.status === 'completed' && progress.downloadUrl ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
                  <Check className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="font-bold text-lg text-white">Video Esportato con Successo! 🎉</h4>
                  <p className="text-xs text-slate-400">Il tuo video è pronto per il download e la condivisione sui social</p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={progress.downloadUrl}
                    download={`${project.title || 'video-social'}.${settings.format}`}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 hover:opacity-90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span>Scarica Video ({settings.format.toUpperCase()})</span>
                  </a>

                  <button
                    onClick={() => setProgress(null)}
                    className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
                  >
                    Esporta Altro Formato
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
                  <span className="absolute font-mono text-xs font-bold text-white">
                    {progress.percent}%
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-white">Rendering Video in Corso...</h4>
                  <p className="text-xs text-slate-400">
                    Elaborazione frame {progress.currentFrame} di {progress.totalFrames}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#1E293B] h-3 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-violet-600 h-full transition-all duration-200"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Export Configuration Form */
          <div className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Formato File Video</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'mp4', label: 'MP4 (Standard Social)', sub: 'TikTok & Reels' },
                  { id: 'webm', label: 'WebM (HD Web)', sub: 'Bassa compressione' },
                  { id: 'gif', label: 'GIF Animata', sub: 'Chat & Anteprime' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSettings({ ...settings, format: f.id as ExportSettings['format'] })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      settings.format === f.id
                        ? 'border-violet-400 bg-violet-600/20 font-bold text-white shadow'
                        : 'border-slate-700 bg-[#1E293B] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-bold">{f.label}</span>
                    <span className="block text-[10px] text-slate-400">{f.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Risoluzione Video</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1080p', label: '1080p Full HD', desc: 'Massima Qualità' },
                  { id: '720p', label: '720p HD', desc: 'Esportazione Rapida' },
                  { id: '540p', label: '540p Social', desc: 'Leggero' },
                ].map((res) => (
                  <button
                    key={res.id}
                    onClick={() => setSettings({ ...settings, resolution: res.id as ExportSettings['resolution'] })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      settings.resolution === res.id
                        ? 'border-violet-400 bg-violet-600/20 font-bold text-white shadow'
                        : 'border-slate-700 bg-[#1E293B] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-bold">{res.label}</span>
                    <span className="block text-[10px] text-slate-400">{res.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate FPS */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Fluidità (FPS)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 30, label: '30 FPS (Standard Social)' },
                  { id: 60, label: '60 FPS (Ultra Fluido)' },
                ].map((fps) => (
                  <button
                    key={fps.id}
                    onClick={() => setSettings({ ...settings, fps: fps.id as ExportSettings['fps'] })}
                    className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                      settings.fps === fps.id
                        ? 'border-violet-400 bg-violet-600/20 text-white shadow'
                        : 'border-slate-700 bg-[#1E293B] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {fps.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message if any */}
            {progress?.status === 'error' && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                {progress.errorMessage || 'Si è verificato un errore durante la creazione.'}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-700 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Annulla
              </button>

              <button
                onClick={handleStartExport}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Avvia Esportazione Rapida</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
