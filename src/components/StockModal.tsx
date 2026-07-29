import React from 'react';
import { STOCK_PHOTOS, COLOR_GRADIENTS } from '../data/builtInAssets';
import { Sparkles, X, Image as ImageIcon, Palette, Plus } from 'lucide-react';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (url: string, name: string) => void;
  onSelectColor: (color: string) => void;
}

export const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  onSelectPhoto,
  onSelectColor,
}) => {
  const [activeTab, setActiveTab] = React.useState<'stock' | 'gradients'>('stock');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-tight">Libreria Immagini Stock & Sfondi</h3>
              <p className="text-xs text-slate-400">Scegli tra foto in alta definizione e gradienti social per aggiungere nuove scene</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-1 bg-[#1E293B] rounded-2xl border border-slate-700 w-fit">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'stock'
                ? 'bg-violet-600 text-white shadow-md border border-violet-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <span>Foto Stock Unsplash</span>
          </button>

          <button
            onClick={() => setActiveTab('gradients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'gradients'
                ? 'bg-violet-600 text-white shadow-md border border-violet-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>Gradienti TikTok & Reels</span>
          </button>
        </div>

        {/* Content Grid */}
        {activeTab === 'stock' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {STOCK_PHOTOS.map((photo) => (
              <div
                key={photo.id}
                onClick={() => {
                  onSelectPhoto(photo.url, photo.name);
                  onClose();
                }}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-slate-700 hover:border-violet-400 cursor-pointer transition-all hover:scale-105 shadow-md"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                  <span className="text-[10px] uppercase font-bold text-pink-400">{photo.category}</span>
                  <span className="text-xs font-bold text-white line-clamp-1">{photo.name}</span>
                </div>
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-violet-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {COLOR_GRADIENTS.map((grad, i) => (
              <div
                key={i}
                onClick={() => {
                  onSelectColor(grad.value);
                  onClose();
                }}
                className="group relative aspect-video rounded-2xl p-4 flex flex-col justify-between border border-slate-700 hover:border-cyan-400 cursor-pointer transition-all hover:scale-105 shadow-md"
                style={{ background: grad.value }}
              >
                <span className="text-xs font-bold text-white drop-shadow">{grad.name}</span>
                <div className="self-end p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
