import React from 'react';
import { Scene, TextOverlay, TextStyle, TextAnimation } from '../types';
import { FONT_OPTIONS } from '../data/builtInAssets';
import { 
  Type, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Clock, 
  Palette,
  Move
} from 'lucide-react';

interface TextEditorProps {
  scene: Scene;
  sceneIndex: number;
  updateScene: (sceneIndex: number, updated: Partial<Scene>) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  scene,
  sceneIndex,
  updateScene,
}) => {
  const [selectedTextId, setSelectedTextId] = React.useState<string | null>(
    scene.textOverlays.length > 0 ? scene.textOverlays[0].id : null
  );

  const activeOverlay = scene.textOverlays.find((t) => t.id === selectedTextId) || scene.textOverlays[0];

  const handleAddText = () => {
    const newText: TextOverlay = {
      id: `text-${Date.now()}`,
      text: 'NUOVO TESTO TIKTOK',
      fontFamily: 'Bebas Neue',
      fontSize: 36,
      color: '#ffffff',
      backgroundColor: '#facc15',
      style: 'tiktok-yellow',
      animation: 'pop',
      position: { x: 50, y: scene.textOverlays.length === 0 ? 50 : 75 },
      align: 'center',
      startTime: 0,
      duration: scene.duration,
    };

    updateScene(sceneIndex, {
      textOverlays: [...scene.textOverlays, newText],
    });
    setSelectedTextId(newText.id);
  };

  const handleUpdateText = (updatedField: Partial<TextOverlay>) => {
    if (!activeOverlay) return;
    const updatedList = scene.textOverlays.map((t) =>
      t.id === activeOverlay.id ? { ...t, ...updatedField } : t
    );
    updateScene(sceneIndex, { textOverlays: updatedList });
  };

  const handleDeleteText = (id: string) => {
    const updatedList = scene.textOverlays.filter((t) => t.id !== id);
    updateScene(sceneIndex, { textOverlays: updatedList });
    if (selectedTextId === id) {
      setSelectedTextId(updatedList.length > 0 ? updatedList[0].id : null);
    }
  };

  const stylePresets: { id: TextStyle; label: string; previewClass: string }[] = [
    { id: 'tiktok-yellow', label: 'TikTok Evidenziatore Giallo', previewClass: 'bg-yellow-400 text-black font-bold' },
    { id: 'neon', label: 'Neon Glow Ciano', previewClass: 'bg-slate-900 text-cyan-400 border border-cyan-400 shadow' },
    { id: 'impact-box', label: 'Box Rosso Impact', previewClass: 'bg-red-500 text-white font-bold' },
    { id: 'aesthetic', label: 'Vetro Translucido', previewClass: 'bg-black/60 text-white border border-white/20' },
    { id: 'classic', label: 'Classico con Bordo Nero', previewClass: 'bg-slate-900 text-white border border-slate-700' },
  ];

  const animationOptions: { id: TextAnimation; label: string }[] = [
    { id: 'none', label: 'Fisso' },
    { id: 'fade', label: 'Dissolvenza' },
    { id: 'pop', label: 'Pop / Bouncing' },
    { id: 'slide-up', label: 'Scorrimento dal Basso' },
    { id: 'typewriter', label: 'Macchina da Scrivere' },
    { id: 'pulse', label: 'Pulsazione Beat' },
  ];

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-pink-400" />
          <h4 className="font-bold text-sm text-white tracking-tight">Testi & Didascalie Scena</h4>
          <span className="text-xs text-slate-400 font-mono">({scene.textOverlays.length})</span>
        </div>

        <button
          onClick={handleAddText}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-pink-500/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Aggiungi Testo</span>
        </button>
      </div>

      {scene.textOverlays.length === 0 ? (
        <div className="p-8 text-center bg-[#0F172A]/60 rounded-xl border border-dashed border-slate-700 space-y-2">
          <Type className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400">Nessun testo aggiunto a questa scena.</p>
          <button
            onClick={handleAddText}
            className="px-3 py-1.5 bg-slate-800 text-pink-400 rounded-xl text-xs font-bold hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            + Aggiungi Primo Testo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Layer Selector Column */}
          <div className="space-y-2 bg-[#0F172A]/80 p-3.5 rounded-xl border border-slate-700/80">
            <span className="text-xs font-bold text-slate-300">Livelli Testo</span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {scene.textOverlays.map((t) => {
                const isSelected = activeOverlay?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTextId(t.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-violet-400 bg-violet-600/20 text-white font-bold'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate max-w-[120px]">{t.text || 'Testo vuoto'}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteText(t.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Elimina Testo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Overlay Properties */}
          {activeOverlay && (
            <div className="md:col-span-2 space-y-3 bg-[#0F172A]/80 p-3.5 rounded-xl border border-slate-700/80">
              {/* Text Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Contenuto Testo</label>
                <input
                  type="text"
                  value={activeOverlay.text}
                  onChange={(e) => handleUpdateText({ text: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium focus:border-pink-500 outline-none"
                  placeholder="Scrivi la tua didascalia..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Font Options */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Carattere Font</label>
                  <select
                    value={activeOverlay.fontFamily}
                    onChange={(e) => handleUpdateText({ fontFamily: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-300">
                    <span>Dimensione</span>
                    <span className="font-mono text-pink-400">{activeOverlay.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={72}
                    value={activeOverlay.fontSize}
                    onChange={(e) => handleUpdateText({ fontSize: parseInt(e.target.value) })}
                    className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* TikTok Style Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Stile Grafico TikTok
                </label>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {stylePresets.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleUpdateText({ style: st.id })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all ${st.previewClass} ${
                        activeOverlay.style === st.id ? 'ring-2 ring-pink-500 border-pink-500 scale-105 shadow' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Animation & Alignment */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/80">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Animazione Entrata</label>
                  <select
                    value={activeOverlay.animation}
                    onChange={(e) => handleUpdateText({ animation: e.target.value as TextAnimation })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                  >
                    {animationOptions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Posizione Verticale</label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-700 text-xs text-center font-bold">
                    <button
                      onClick={() => handleUpdateText({ position: { x: activeOverlay.position.x, y: 20 } })}
                      className={`py-1 rounded-lg transition-all ${activeOverlay.position.y === 20 ? 'bg-violet-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Alto
                    </button>
                    <button
                      onClick={() => handleUpdateText({ position: { x: activeOverlay.position.x, y: 50 } })}
                      className={`py-1 rounded-lg transition-all ${activeOverlay.position.y === 50 ? 'bg-violet-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Centro
                    </button>
                    <button
                      onClick={() => handleUpdateText({ position: { x: activeOverlay.position.x, y: 75 } })}
                      className={`py-1 rounded-lg transition-all ${activeOverlay.position.y === 75 ? 'bg-violet-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Basso
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
