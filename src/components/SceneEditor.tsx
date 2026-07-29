import React from 'react';
import { Scene, FitMode, FilterType } from '../types';
import { 
  Clock, 
  Crop, 
  Sliders, 
  Sparkles, 
  Scissors, 
  ZoomIn, 
  Move,
  Palette
} from 'lucide-react';

interface SceneEditorProps {
  scene: Scene;
  sceneIndex: number;
  totalScenes: number;
  updateScene: (sceneIndex: number, updated: Partial<Scene>) => void;
  openTrimModal: (sceneIndex: number) => void;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({
  scene,
  sceneIndex,
  updateScene,
  openTrimModal,
}) => {
  const filterPresets: { id: FilterType; label: string; color: string }[] = [
    { id: 'none', label: 'Nessuno', color: 'bg-slate-700' },
    { id: 'tiktok-warm', label: 'TikTok Warm', color: 'bg-amber-500' },
    { id: 'cyberpunk', label: 'Cyberpunk', color: 'bg-fuchsia-600' },
    { id: 'vintage', label: 'Vintage 8mm', color: 'bg-yellow-700' },
    { id: 'bw', label: 'B&W Contrast', color: 'bg-slate-400' },
    { id: 'sunset', label: 'Sunset Gold', color: 'bg-orange-500' },
    { id: 'vignette', label: 'Vignette Drama', color: 'bg-slate-900' },
  ];

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Inspector Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-pink-400/10 text-pink-400 font-bold text-xs uppercase tracking-wider">
            Scena #{sceneIndex + 1}
          </span>
          <h4 className="font-bold text-sm text-white tracking-tight">Proprietà Scena</h4>
        </div>

        <button
          onClick={() => openTrimModal(sceneIndex)}
          className="px-3.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Strumento Taglio Preciso</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Duration & Fit Mode */}
        <div className="space-y-3 bg-[#0F172A]/80 p-3.5 rounded-xl border border-slate-700/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-pink-400" />
              <span>Durata Scena (Secondi)</span>
            </label>
            <span className="text-xs font-mono font-bold text-pink-400">
              {scene.duration.toFixed(1)}s
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.5}
              max={15}
              step={0.1}
              value={scene.duration}
              onChange={(e) => updateScene(sceneIndex, { duration: parseFloat(e.target.value) })}
              className="flex-1 accent-pink-500 bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer"
            />
            <input
              type="number"
              min={0.5}
              max={30}
              step={0.1}
              value={scene.duration}
              onChange={(e) => updateScene(sceneIndex, { duration: Math.max(0.1, parseFloat(e.target.value) || 1) })}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-center text-white p-1"
            />
          </div>

          {/* Fit Mode Selector */}
          <div className="pt-2 border-t border-slate-700/80">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <Crop className="w-3.5 h-3.5 text-cyan-400" />
              <span>Adattamento Media</span>
            </label>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-700">
              {(['cover', 'contain', 'custom'] as FitMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateScene(sceneIndex, { fitMode: mode })}
                  className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    scene.fitMode === mode
                      ? 'bg-violet-600 text-white font-bold border border-violet-400 shadow-md shadow-violet-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'cover' ? 'Riempi (Cover)' : mode === 'contain' ? 'Intero (Fit)' : 'Personalizzato'}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Zoom & Pan controls */}
          {scene.fitMode === 'custom' && (
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <ZoomIn className="w-3 h-3 text-violet-400" /> Zoom
                </span>
                <span className="font-mono text-slate-300 font-bold">{scene.zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={3.0}
                step={0.05}
                value={scene.zoom}
                onChange={(e) => updateScene(sceneIndex, { zoom: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Move className="w-3 h-3 text-violet-400" /> Posizione Orizzontale
                </span>
                <span className="font-mono text-slate-300 font-bold">{scene.panX}%</span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                step={1}
                value={scene.panX}
                onChange={(e) => updateScene(sceneIndex, { panX: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* 2. Background Color & Solid Fill */}
        <div className="space-y-3 bg-[#0F172A]/80 p-3.5 rounded-xl border border-slate-700/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sfondo & Tinta Unita</span>
            </label>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
              {scene.mediaType === 'color' ? 'Tinta Unita' : 'Media + Sfondo'}
            </span>
          </div>

          {/* Toggle Type */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                const isVid = scene.mediaUrl && scene.mediaUrl.match(/\.(mp4|webm|mov)$/i);
                updateScene(sceneIndex, { mediaType: isVid ? 'video' : 'image' });
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scene.mediaType !== 'color'
                  ? 'bg-violet-600 text-white font-bold border border-violet-400 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Foto / Video
            </button>
            <button
              onClick={() =>
                updateScene(sceneIndex, {
                  mediaType: 'color',
                  colorFill: scene.colorFill || '#0f172a',
                })
              }
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scene.mediaType === 'color'
                  ? 'bg-violet-600 text-white font-bold border border-violet-400 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tinta Unita
            </button>
          </div>

          {/* Color Presets & Picker */}
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span>Colore Sfondo:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={scene.colorFill && !scene.colorFill.includes('gradient') ? scene.colorFill : '#0f172a'}
                  onChange={(e) =>
                    updateScene(sceneIndex, {
                      colorFill: e.target.value,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={scene.colorFill || '#0f172a'}
                  onChange={(e) =>
                    updateScene(sceneIndex, {
                      colorFill: e.target.value,
                    })
                  }
                  placeholder="#0f172a"
                  className="w-20 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-center text-white px-1 py-0.5"
                />
              </div>
            </div>

            {/* Quick Swatches */}
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {[
                '#000000',
                '#0f172a',
                '#ffffff',
                '#7c3aed',
                '#ec4899',
                '#ef4444',
                '#f97316',
                '#eab308',
                '#10b981',
                '#06b6d4',
                'linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #f093fb 100%)',
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              ].map((color, i) => (
                <button
                  key={i}
                  onClick={() =>
                    updateScene(sceneIndex, {
                      colorFill: color,
                    })
                  }
                  title={color}
                  className={`h-7 rounded-lg border transition-all hover:scale-105 shadow-sm ${
                    scene.colorFill === color ? 'border-2 border-white ring-2 ring-cyan-400' : 'border-slate-700/80'
                  }`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. Filters & Adjustments */}
        <div className="space-y-3 bg-[#0F172A]/80 p-3.5 rounded-xl border border-slate-700/80">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Filtri Social TikTok & Reels</span>
          </label>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
            {filterPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => updateScene(sceneIndex, { filter: preset.id })}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  scene.filter === preset.id
                    ? 'border-violet-400 bg-violet-600/30 text-white'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${preset.color}`}></span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Color Sliders */}
          <div className="space-y-2 pt-2 border-t border-slate-700/80 text-xs">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-pink-400" />
              <span>Luminosità, Contrasto e Saturazione</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                  <span>Luminosità</span>
                  <span className="text-pink-400">{scene.brightness}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={scene.brightness}
                  onChange={(e) => updateScene(sceneIndex, { brightness: parseInt(e.target.value) })}
                  className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                  <span>Contrasto</span>
                  <span className="text-pink-400">{scene.contrast}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={scene.contrast}
                  onChange={(e) => updateScene(sceneIndex, { contrast: parseInt(e.target.value) })}
                  className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                  <span>Saturazione</span>
                  <span className="text-pink-400">{scene.saturation}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={scene.saturation}
                  onChange={(e) => updateScene(sceneIndex, { saturation: parseInt(e.target.value) })}
                  className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
