import React from 'react';
import { STARTER_TEMPLATES } from '../data/builtInAssets';
import { PresetTemplate } from '../types';
import { Sparkles, X, ArrowRight, Play, Film } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PresetTemplate) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-tight">Template Pronte per TikTok & Reels</h3>
              <p className="text-xs text-slate-400">Inizia subito con un progetto pre-configurato con grafiche, musica e transizioni</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          {STARTER_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-4 bg-[#1E293B] border border-slate-700 hover:border-violet-400 rounded-2xl transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group shadow-md"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`w-14 h-20 rounded-xl bg-gradient-to-br ${tmpl.previewGradient} flex items-center justify-center text-white font-bold shadow-md flex-shrink-0`}>
                  <Film className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-pink-400/10 text-pink-400 text-[10px] font-bold uppercase tracking-wider">
                      {tmpl.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {tmpl.scenes.length} Scene
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-white group-hover:text-pink-400 transition-colors">
                    {tmpl.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 max-w-sm">
                    {tmpl.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectTemplate(tmpl);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/25 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                <span>Usa Template</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
