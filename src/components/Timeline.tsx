import React from 'react';
import { Scene, TransitionType } from '../types';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  Scissors, 
  Zap, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Palette,
  Sparkles
} from 'lucide-react';

interface TimelineProps {
  scenes: Scene[];
  activeSceneIndex: number;
  setActiveSceneIndex: (index: number) => void;
  addScene: (mediaType: 'image' | 'video' | 'color', url?: string) => void;
  deleteScene: (index: number) => void;
  duplicateScene: (index: number) => void;
  moveScene: (fromIndex: number, toIndex: number) => void;
  openTransitionModal: (sceneIndex: number) => void;
  openTrimModal: (sceneIndex: number) => void;
  openStockModal: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  scenes,
  activeSceneIndex,
  setActiveSceneIndex,
  addScene,
  deleteScene,
  duplicateScene,
  moveScene,
  openTransitionModal,
  openTrimModal,
  openStockModal,
}) => {

  const getTransitionLabel = (type: TransitionType) => {
    switch (type) {
      case 'fade': return 'Dissolvenza';
      case 'slide-left': return 'Scorr. Sinistra';
      case 'slide-right': return 'Scorr. Destra';
      case 'slide-up': return 'Scorr. Su';
      case 'slide-down': return 'Scorr. Giù';
      case 'zoom-in': return 'Zoom In';
      case 'zoom-out': return 'Zoom Out';
      case 'wipe': return 'Wipe';
      case 'blur': return 'Sfumatura';
      case 'glitch': return 'Glitch';
      case 'flash': return 'Flash Bianco';
      default: return 'Nessuna';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video');
      const url = URL.createObjectURL(file);
      addScene(isVideo ? 'video' : 'image', url);
    }
  };

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-4 space-y-3 shadow-xl">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
          <h3 className="font-bold text-sm text-white tracking-tight">Sequenza Scene & Transizioni</h3>
          <span className="text-xs text-slate-400 font-mono">({scenes.length} scene)</span>
        </div>

        {/* Add Scene Actions */}
        <div className="flex items-center gap-2">
          <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
            <Plus className="w-3.5 h-3.5 text-pink-400" />
            <span>Carica Foto/Video</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={openStockModal}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Foto Stock</span>
          </button>

          <button
            onClick={() => addScene('color', '#0f172a')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tinta Unita</span>
          </button>
        </div>
      </div>

      {/* Timeline Track Scroll Area */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 min-h-[140px] scrollbar-thin scrollbar-thumb-slate-700">
        {scenes.map((scene, idx) => {
          const isActive = idx === activeSceneIndex;

          return (
            <React.Fragment key={scene.id}>
              {/* Scene Card */}
              <div
                onClick={() => setActiveSceneIndex(idx)}
                className={`relative flex-shrink-0 w-32 h-28 rounded-xl border-2 transition-all cursor-pointer group flex flex-col justify-between p-2 overflow-hidden ${
                  isActive
                    ? 'border-violet-400 bg-slate-800 shadow-lg shadow-violet-500/20'
                    : 'border-slate-800 bg-[#0F172A] hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                {/* Scene Media Thumbnail Preview */}
                <div className="absolute inset-0 z-0 bg-slate-950">
                  {scene.mediaType === 'color' || !scene.mediaUrl ? (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: scene.colorFill || '#0f172a' }}
                    />
                  ) : scene.mediaType === 'image' ? (
                    <img
                      src={scene.mediaUrl}
                      alt={scene.title || `Scena ${idx + 1}`}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <video
                      src={scene.mediaUrl}
                      className="w-full h-full object-cover opacity-80"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40"></div>
                </div>

                {/* Card Top Row: Scene Index & Type Icon */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[10px] font-bold">
                    #{idx + 1}
                  </span>
                  <div className="p-1 rounded bg-black/70 text-slate-300">
                    {scene.mediaType === 'image' ? (
                      <ImageIcon className="w-3 h-3 text-pink-400" />
                    ) : scene.mediaType === 'video' ? (
                      <VideoIcon className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <Palette className="w-3 h-3 text-amber-400" />
                    )}
                  </div>
                </div>

                {/* Card Hover Quick Controls */}
                <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 bg-black/80 py-1 rounded-lg backdrop-blur-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (idx > 0) moveScene(idx, idx - 1);
                    }}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                    title="Sposta a sinistra"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openTrimModal(idx);
                    }}
                    className="p-1 rounded hover:bg-slate-700 text-pink-400"
                    title="Taglia e regola durata"
                  >
                    <Scissors className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateScene(idx);
                    }}
                    className="p-1 rounded hover:bg-slate-700 text-slate-300"
                    title="Duplica scena"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScene(idx);
                    }}
                    disabled={scenes.length <= 1}
                    className="p-1 rounded hover:bg-slate-700 text-rose-400 disabled:opacity-30"
                    title="Elimina scena"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (idx < scenes.length - 1) moveScene(idx, idx + 1);
                    }}
                    disabled={idx === scenes.length - 1}
                    className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                    title="Sposta a destra"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Card Bottom Row: Duration */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-200 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700/80 font-bold">
                    {scene.duration.toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* Transition Badge between scenes */}
              {idx < scenes.length - 1 && (
                <button
                  onClick={() => openTransitionModal(idx)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 px-2.5 py-2 rounded-xl border text-[11px] font-bold transition-all group/trans ${
                    scene.transition.type !== 'none'
                      ? 'bg-violet-600/20 text-violet-400 border-violet-500/50 shadow-md shadow-violet-500/10'
                      : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-600'
                  }`}
                  title="Cambia Transizione"
                >
                  <Zap className="w-3.5 h-3.5 text-violet-400 group-hover/trans:scale-125 transition-transform" />
                  <span className="text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                    {getTransitionLabel(scene.transition.type)}
                  </span>
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
