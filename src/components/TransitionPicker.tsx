import React from 'react';
import { Scene, TransitionType } from '../types';
import { 
  Zap, 
  X, 
  Check, 
  Sliders, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles,
  Layers
} from 'lucide-react';

interface TransitionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  scene: Scene;
  sceneIndex: number;
  onSelectTransition: (type: TransitionType, duration: number, applyToAll: boolean) => void;
}

export const TransitionPicker: React.FC<TransitionPickerProps> = ({
  isOpen,
  onClose,
  scene,
  sceneIndex,
  onSelectTransition,
}) => {
  const [selectedType, setSelectedType] = React.useState<TransitionType>(scene?.transition?.type || 'fade');
  const [duration, setDuration] = React.useState<number>(scene?.transition?.duration || 0.5);

  React.useEffect(() => {
    if (scene) {
      setSelectedType(scene.transition?.type || 'fade');
      setDuration(scene.transition?.duration || 0.5);
    }
  }, [scene]);

  if (!isOpen || !scene) return null;

  const transitionOptions: { id: TransitionType; name: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'none', name: 'Nessuna (Taglio Netto)', desc: 'Cambio immediato senza effetti', icon: <X className="w-5 h-5 text-slate-400" /> },
    { id: 'fade', name: 'Dissolvenza', desc: 'Incrocio morbido tra le due immagini', icon: <Layers className="w-5 h-5 text-pink-400" /> },
    { id: 'slide-left', name: 'Scorrimento Sinistra', desc: 'La nuova scena entra da destra verso sinistra', icon: <ArrowLeft className="w-5 h-5 text-cyan-400" /> },
    { id: 'slide-right', name: 'Scorrimento Destra', desc: 'Entrata da sinistra verso destra', icon: <ArrowRight className="w-5 h-5 text-cyan-400" /> },
    { id: 'slide-up', name: 'Scorrimento Su', desc: 'Entrata dal basso verso l\'alto', icon: <ArrowUp className="w-5 h-5 text-cyan-400" /> },
    { id: 'slide-down', name: 'Scorrimento Giù', desc: 'Entrata dall\'alto verso il basso', icon: <ArrowDown className="w-5 h-5 text-cyan-400" /> },
    { id: 'zoom-in', name: 'Zoom In', desc: 'Zoom dinamico verso l\'interno', icon: <ZoomIn className="w-5 h-5 text-amber-400" /> },
    { id: 'zoom-out', name: 'Zoom Out', desc: 'Zoom dinamico all\'indietro', icon: <ZoomOut className="w-5 h-5 text-amber-400" /> },
    { id: 'wipe', name: 'Taglio Wipe', desc: 'Tendina di transizione pulita', icon: <Maximize2 className="w-5 h-5 text-emerald-400" /> },
    { id: 'glitch', name: 'Glitch Digitale', desc: 'Effetto interferenza cyber TikTok', icon: <Zap className="w-5 h-5 text-purple-400" /> },
    { id: 'flash', name: 'Flash Bianco', desc: 'Lampo di luce prima della nuova scena', icon: <Sparkles className="w-5 h-5 text-yellow-300" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-tight">Libreria Transizioni</h3>
              <p className="text-xs text-slate-400">Seleziona l'effetto di passaggio tra la Scena #{sceneIndex + 1} e la successiva</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duration Control Slider */}
        <div className="bg-[#1E293B] p-3.5 rounded-2xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-pink-400" />
              <span>Durata Transizione</span>
            </span>
            <span className="font-mono text-pink-400">{duration.toFixed(1)}s</span>
          </div>

          <input
            type="range"
            min={0.2}
            max={1.5}
            step={0.1}
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer"
          />
        </div>

        {/* Transition Grid List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          {transitionOptions.map((item) => {
            const isSelected = selectedType === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedType(item.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-violet-400 bg-violet-600/20 ring-2 ring-violet-500/20 shadow-md'
                    : 'border-slate-700 bg-[#1E293B] hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-700">
                    {item.icon}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-pink-400 font-bold" />}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700 gap-2">
          <button
            onClick={() => {
              onSelectTransition(selectedType, duration, true);
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Applica a Tutte le Scene
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Annulla
            </button>

            <button
              onClick={() => {
                onSelectTransition(selectedType, duration, false);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-pink-500/20 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Salva</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
