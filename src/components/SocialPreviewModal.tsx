import React, { useState } from 'react';
import { Project } from '../types';
import { X, Heart, MessageCircle, Share2, Music, Copy, Check, Sparkles } from 'lucide-react';

interface SocialPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const SocialPreviewModal: React.FC<SocialPreviewModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [copied, setCopied] = useState(false);
  const [captionText, setCaptionText] = useState(
    'Guarda questo video fino alla fine! 🔥 Non crederai ai tuoi occhi. Segui per altri contenuti simili! #TikTok #Reels #Viral #Trending #ForYou'
  );

  if (!isOpen) return null;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-tight">Simulatore Anteprima Social</h3>
              <p className="text-xs text-slate-400">Verifica come appare il tuo contenuto su TikTok o Instagram Reels</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Simulated Smartphone Screen */}
          <div className="relative aspect-[9/16] max-h-80 mx-auto rounded-2xl bg-[#1E293B] overflow-hidden border border-slate-700 p-3 flex flex-col justify-between shadow-2xl w-full max-w-[200px]">
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white text-[10px] font-bold">
              <span>Per Te</span>
              <span className="opacity-60">Seguiti</span>
            </div>

            {/* Bottom Overlay Info */}
            <div className="space-y-1.5 text-white z-10">
              <div className="font-bold text-xs flex items-center gap-1">
                <span>@tuoprofilo</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              </div>
              <p className="text-[10px] text-slate-200 line-clamp-2 leading-tight">
                {captionText}
              </p>
              <div className="flex items-center gap-1 text-[9px] text-slate-300 font-bold">
                <Music className="w-2.5 h-2.5 text-pink-400 animate-spin" />
                <span className="truncate">Suono Originale - {project.title || 'Video Creator'}</span>
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="absolute right-2 bottom-8 flex flex-col items-center gap-3 text-white text-[9px] font-bold z-10">
              <div className="flex flex-col items-center gap-0.5">
                <div className="p-1.5 rounded-full bg-black/40 backdrop-blur-xs">
                  <Heart className="w-4 h-4 text-rose-500 fill-current" />
                </div>
                <span>48.2k</span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <div className="p-1.5 rounded-full bg-black/40 backdrop-blur-xs">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <span>1,240</span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <div className="p-1.5 rounded-full bg-black/40 backdrop-blur-xs">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <span>Condividi</span>
              </div>
            </div>
          </div>

          {/* Caption & Hashtag Assistant */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Didascalia & Hashtag Social</label>
              <textarea
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                rows={5}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-pink-500 outline-none resize-none font-medium"
              />
            </div>

            <button
              onClick={handleCopyCaption}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer active:scale-95 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Didascalia Copiata!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-pink-400" />
                  <span>Copia Didascalia & Hashtag</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
