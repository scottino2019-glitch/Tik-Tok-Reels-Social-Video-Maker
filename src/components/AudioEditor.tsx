import React from 'react';
import { AudioTrack, SoundEffect } from '../types';
import { BUILTIN_AUDIO_TRACKS, SOUND_EFFECTS_LIST } from '../data/builtInAssets';
import { audioEngine } from '../utils/audioEngine';
import { 
  Music, 
  Volume2, 
  Plus, 
  Trash2, 
  Play, 
  VolumeX, 
  Sliders, 
  Clock, 
  Sparkles,
  Disc
} from 'lucide-react';

interface AudioEditorProps {
  audioTracks: AudioTrack[];
  soundEffects: SoundEffect[];
  setAudioTracks: React.Dispatch<React.SetStateAction<AudioTrack[]>>;
  setSoundEffects: React.Dispatch<React.SetStateAction<SoundEffect[]>>;
  totalDuration: number;
}

export const AudioEditor: React.FC<AudioEditorProps> = ({
  audioTracks,
  soundEffects,
  setAudioTracks,
  setSoundEffects,
  totalDuration,
}) => {
  const [selectedSynthPreset, setSelectedSynthPreset] = React.useState('upbeat');

  const handleAddSynthTrack = (preset: typeof BUILTIN_AUDIO_TRACKS[0]) => {
    audioEngine.resumeContext();
    const newTrack: AudioTrack = {
      id: `audio-${Date.now()}`,
      name: preset.name,
      url: '',
      isSynth: true,
      synthPreset: preset.synthPreset,
      volume: 0.8,
      startTime: 0,
      audioStartOffset: 0,
      duration: totalDuration || 10.0,
      fadeIn: true,
      fadeOut: true,
    };
    setAudioTracks([newTrack]); // Replace or add
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    audioEngine.resumeContext();
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newTrack: AudioTrack = {
      id: `custom-audio-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      url,
      isSynth: false,
      volume: 0.8,
      startTime: 0,
      audioStartOffset: 0,
      duration: totalDuration || 10.0,
      fadeIn: true,
      fadeOut: true,
    };
    setAudioTracks([newTrack]);
  };

  const handleUpdateTrack = (id: string, updated: Partial<AudioTrack>) => {
    setAudioTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const handleDeleteTrack = (id: string) => {
    setAudioTracks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddSFX = (type: SoundEffect['type'], name: string) => {
    const newSFX: SoundEffect = {
      id: `sfx-${Date.now()}`,
      name,
      type,
      triggerTime: 0.5,
      volume: 0.8,
    };
    setSoundEffects((prev) => [...prev, newSFX]);
    audioEngine.playSoundEffect(type, 0.8);
  };

  const handleDeleteSFX = (id: string) => {
    setSoundEffects((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-sm text-white tracking-tight">Musica di Sfondo ed Effetti Sonori</h4>
        </div>

        <label className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Carica MP3 Personalizzato</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleCustomAudioUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Background Audio Track */}
        <div className="space-y-3 bg-[#0F172A]/80 p-3.5 rounded-xl border border-slate-700/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-pink-400" />
              <span>Traccia Musicale Principale</span>
            </span>
          </div>

          {audioTracks.length === 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-medium">Scegli uno dei brani royalty-free integrati:</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {BUILTIN_AUDIO_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    className="p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl flex items-center justify-between text-xs hover:border-slate-600 transition-colors"
                  >
                    <div>
                      <h5 className="font-bold text-white">{track.name}</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{track.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          audioEngine.resumeContext();
                          const tempTrack: AudioTrack = {
                            id: 'preview-' + track.id,
                            name: track.name,
                            url: '',
                            isSynth: true,
                            synthPreset: track.synthPreset,
                            volume: 0.8,
                            startTime: 0,
                            audioStartOffset: 0,
                            duration: 2.5,
                            fadeIn: true,
                            fadeOut: true,
                          };
                          let t = 0;
                          const timer = setInterval(() => {
                            t += 0.05;
                            audioEngine.playAudioTrackAt(tempTrack, t, true);
                            if (t >= 2.5) {
                              clearInterval(timer);
                              audioEngine.stopAll();
                            }
                          }, 50);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700 cursor-pointer"
                        title="Ascolta Anteprima"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                      <button
                        onClick={() => handleAddSynthTrack(track)}
                        className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-[10px] shadow-sm shadow-violet-500/20 cursor-pointer"
                      >
                        Usa Brano
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Active Audio Track Controls */
            <div className="space-y-3">
              {audioTracks.map((track) => (
                <div key={track.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-pink-400" />
                      {track.name}
                    </span>
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                      title="Rimuovi Traccia Audio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Volume Musica</span>
                      <span className="font-mono text-cyan-400">{Math.round(track.volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={track.volume}
                      onChange={(e) => handleUpdateTrack(track.id, { volume: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Fade In / Fade Out Toggles */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-[11px] font-bold">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={track.fadeIn}
                        onChange={(e) => handleUpdateTrack(track.id, { fadeIn: e.target.checked })}
                        className="rounded accent-pink-500"
                      />
                      <span>Fade In (Entrata Dolce)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={track.fadeOut}
                        onChange={(e) => handleUpdateTrack(track.id, { fadeOut: e.target.checked })}
                        className="rounded accent-pink-500"
                      />
                      <span>Fade Out (Uscita Dolce)</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Sound Effects Library (SFX) */}
        <div className="space-y-3 bg-[#0F172A]/80 p-3.5 rounded-xl border border-slate-700/80">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Libreria Effetti Sonori (SFX)</span>
          </span>

          {/* Quick SFX Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            {SOUND_EFFECTS_LIST.map((sfx) => (
              <button
                key={sfx.type}
                onClick={() => handleAddSFX(sfx.type, sfx.name)}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left text-[11px] font-bold text-slate-200 transition-colors flex items-center justify-between"
              >
                <span className="truncate">{sfx.name}</span>
                <Plus className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Added SFX List */}
          {soundEffects.length > 0 && (
            <div className="pt-2 border-t border-slate-700/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Effetti Attivi sulla Timeline</span>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {soundEffects.map((s) => (
                  <div
                    key={s.id}
                    className="p-2 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          audioEngine.resumeContext();
                          audioEngine.playSoundEffect(s.type, s.volume);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-pink-400 hover:bg-slate-700 border border-slate-700 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                      <span className="font-bold text-white text-[11px]">{s.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-bold">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <input
                          type="number"
                          min={0}
                          max={totalDuration}
                          step={0.1}
                          value={s.triggerTime}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setSoundEffects((prev) => prev.map((item) => (item.id === s.id ? { ...item, triggerTime: val } : item)));
                          }}
                          className="w-12 bg-slate-950 border border-slate-700 rounded px-1 text-center text-white font-mono"
                        />
                        <span>s</span>
                      </div>

                      <button
                        onClick={() => handleDeleteSFX(s.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
