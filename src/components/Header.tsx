import React from 'react';
import { AspectRatio } from '../types';
import { 
  Video, 
  Smartphone, 
  Square, 
  Layout, 
  Tv, 
  Volume2, 
  VolumeX, 
  Download, 
  Sparkles, 
  RotateCcw,
  Film
} from 'lucide-react';

interface HeaderProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  isMuted: boolean;
  toggleMute: () => void;
  openTemplates: () => void;
  openExportModal: () => void;
  openSocialPreview: () => void;
  resetProject: () => void;
  projectTitle: string;
  setProjectTitle: (t: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  aspectRatio,
  setAspectRatio,
  isMuted,
  toggleMute,
  openTemplates,
  openExportModal,
  openSocialPreview,
  resetProject,
  projectTitle,
  setProjectTitle,
}) => {
  const aspectRatios: { id: AspectRatio; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: '9:16', label: '9:16', sub: 'TikTok / Reels', icon: <Smartphone className="w-4 h-4" /> },
    { id: '1:1', label: '1:1', sub: 'Square Feed', icon: <Square className="w-4 h-4" /> },
    { id: '4:5', label: '4:5', sub: 'Portrait', icon: <Layout className="w-4 h-4" /> },
    { id: '16:9', label: '16:9', sub: 'Landscape', icon: <Tv className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-[#1E293B] border-b border-slate-700 px-4 py-3 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="bg-transparent text-sm md:text-base font-bold text-white focus:bg-slate-800 px-2 py-0.5 rounded border border-transparent focus:border-violet-500/50 outline-none transition-all tracking-tight"
                  placeholder="Nome Video..."
                />
                <span className="text-[10px] font-bold text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Video Studio per TikTok & Instagram Reels</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={openExportModal}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              ESPORTA
            </button>
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex items-center bg-[#0F172A] p-1 rounded-xl border border-slate-700 overflow-x-auto max-w-full">
          {aspectRatios.map((ar) => (
            <button
              key={ar.id}
              onClick={() => setAspectRatio(ar.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                aspectRatio === ar.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20 border border-violet-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title={`${ar.label} - ${ar.sub}`}
            >
              {ar.icon}
              <span>{ar.label}</span>
              <span className="hidden lg:inline text-[10px] opacity-80">({ar.sub})</span>
            </button>
          ))}
        </div>

        {/* Actions & Export */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={openTemplates}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            Template
          </button>

          <button
            onClick={openSocialPreview}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Anteprima Social TikTok/Reels"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            Anteprima Social
          </button>

          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border text-xs transition-all ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Attiva Audio' : 'Disattiva Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={resetProject}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 hover:bg-slate-700 text-xs transition-all"
            title="Reset Progetto"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={openExportModal}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            ESPORTA
          </button>
        </div>
      </div>
    </header>
  );
};

