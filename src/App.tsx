import React, { useState } from 'react';
import { Project, Scene, AspectRatio, TransitionType, PresetTemplate, SoundEffect } from './types';
import { STARTER_TEMPLATES } from './data/builtInAssets';
import { Header } from './components/Header';
import { PreviewPlayer } from './components/PreviewPlayer';
import { Timeline } from './components/Timeline';
import { SceneEditor } from './components/SceneEditor';
import { TextEditor } from './components/TextEditor';
import { AudioEditor } from './components/AudioEditor';
import { TrimModal } from './components/TrimModal';
import { TransitionPicker } from './components/TransitionPicker';
import { StockModal } from './components/StockModal';
import { TemplateModal } from './components/TemplateModal';
import { ExportModal } from './components/ExportModal';
import { SocialPreviewModal } from './components/SocialPreviewModal';
import { audioEngine } from './utils/audioEngine';
import { canvasRenderer } from './utils/canvasRenderer';
import { Sliders, Type, Music, Layers } from 'lucide-react';

export default function App() {
  // Initialize with TikTok Viral Hook template
  const defaultTemplate = STARTER_TEMPLATES[0];

  const [project, setProject] = useState<Project>({
    id: `project-${Date.now()}`,
    title: 'TikTok Viral Clip',
    aspectRatio: '9:16',
    showProgressBar: true,
    scenes: defaultTemplate.scenes.map((s, idx) => ({
      ...s,
      id: `scene-${idx + 1}`,
    })),
    audioTracks: defaultTemplate.audioTracks.map((a, idx) => ({
      ...a,
      id: `audio-${idx + 1}`,
    })),
    soundEffects: defaultTemplate.soundEffects.map((sfx, idx) => ({
      ...sfx,
      id: `sfx-${idx + 1}`,
    })),
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'scene' | 'text' | 'audio'>('scene');

  // Modals state
  const [isTrimModalOpen, setIsTrimModalOpen] = useState(false);
  const [trimSceneIndex, setTrimSceneIndex] = useState(0);

  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [transitionSceneIndex, setTransitionSceneIndex] = useState(0);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSocialPreviewOpen, setIsSocialPreviewOpen] = useState(false);

  const totalDuration = canvasRenderer.getTotalDuration(project.scenes);
  const activeScene = project.scenes[activeSceneIndex] || project.scenes[0];

  // Mute Handler
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMuted(nextMute);
  };

  // Scene Operations
  const updateScene = (index: number, updated: Partial<Scene>) => {
    setProject((prev) => {
      const updatedScenes = prev.scenes.map((s, idx) => (idx === index ? { ...s, ...updated } : s));
      return { ...prev, scenes: updatedScenes };
    });
  };

  const addScene = (mediaType: 'image' | 'video' | 'color', url?: string) => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      mediaType,
      mediaUrl: url || '',
      title: `Scena ${project.scenes.length + 1}`,
      duration: 3.0,
      fitMode: 'cover',
      zoom: 1.0,
      panX: 0,
      panY: 0,
      transition: { type: 'fade', duration: 0.5 },
      textOverlays: [],
      stickers: [],
      filter: 'none',
      brightness: 100,
      contrast: 100,
      saturation: 100,
      colorFill: mediaType === 'color' ? (url || '#0f172a') : undefined,
    };

    const sfxPresets: { type: SoundEffect['type']; name: string }[] = [
      { type: 'whoosh', name: 'Whoosh' },
      { type: 'pop', name: 'Pop' },
      { type: 'shutter', name: 'Scatto Foto' },
      { type: 'ding', name: 'Ding' },
      { type: 'bass', name: 'Bass Drop' },
      { type: 'applause', name: 'Applausi' },
    ];

    setProject((prev) => {
      const currentTotalDuration = prev.scenes.reduce((acc, s) => acc + s.duration, 0);
      const sfxPreset = sfxPresets[prev.scenes.length % sfxPresets.length];
      const autoSFX: SoundEffect = {
        id: `sfx-${Date.now()}`,
        name: `${sfxPreset.name} (Foto ${prev.scenes.length + 1})`,
        type: sfxPreset.type,
        triggerTime: Math.max(0.1, Number((currentTotalDuration - 0.1).toFixed(1))),
        volume: 0.8,
      };

      return {
        ...prev,
        scenes: [...prev.scenes, newScene],
        soundEffects: [...prev.soundEffects, autoSFX],
      };
    });
    setActiveSceneIndex(project.scenes.length);
  };

  const deleteScene = (index: number) => {
    if (project.scenes.length <= 1) return;
    setProject((prev) => ({
      ...prev,
      scenes: prev.scenes.filter((_, idx) => idx !== index),
    }));
    if (activeSceneIndex >= project.scenes.length - 1) {
      setActiveSceneIndex(Math.max(0, project.scenes.length - 2));
    }
  };

  const duplicateScene = (index: number) => {
    const target = project.scenes[index];
    if (!target) return;

    const copy: Scene = {
      ...target,
      id: `scene-${Date.now()}`,
      title: `${target.title || 'Scena'} (Copia)`,
      textOverlays: target.textOverlays.map((t) => ({ ...t, id: `text-${Date.now()}-${Math.random()}` })),
    };

    const newScenes = [...project.scenes];
    newScenes.splice(index + 1, 0, copy);
    setProject((prev) => ({ ...prev, scenes: newScenes }));
    setActiveSceneIndex(index + 1);
  };

  const moveScene = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= project.scenes.length) return;
    const updated = [...project.scenes];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setProject((prev) => ({ ...prev, scenes: updated }));
    setActiveSceneIndex(toIndex);
  };

  // Transition Handler
  const handleSelectTransition = (type: TransitionType, duration: number, applyToAll: boolean) => {
    setProject((prev) => {
      const updatedScenes = prev.scenes.map((s, idx) => {
        if (applyToAll || idx === transitionSceneIndex) {
          return { ...s, transition: { type, duration } };
        }
        return s;
      });
      return { ...prev, scenes: updatedScenes };
    });
  };

  // Precise Trimming Save Handler
  const handleSaveTrim = (index: number, newDuration: number, startTime: number, endTime: number) => {
    updateScene(index, {
      duration: newDuration,
      startTime,
      endTime,
    });
  };

  // Template Loader
  const loadTemplate = (tmpl: PresetTemplate) => {
    setProject({
      id: `project-${Date.now()}`,
      title: tmpl.name,
      aspectRatio: tmpl.aspectRatio,
      showProgressBar: true,
      scenes: tmpl.scenes.map((s, idx) => ({ ...s, id: `scene-${idx + 1}` })),
      audioTracks: tmpl.audioTracks.map((a, idx) => ({ ...a, id: `audio-${idx + 1}` })),
      soundEffects: tmpl.soundEffects.map((sfx, idx) => ({ ...sfx, id: `sfx-${idx + 1}` })),
    });
    setCurrentTime(0);
    setActiveSceneIndex(0);
  };

  const resetProject = () => {
    loadTemplate(defaultTemplate);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        aspectRatio={project.aspectRatio}
        setAspectRatio={(ar) => setProject((p) => ({ ...p, aspectRatio: ar }))}
        isMuted={isMuted}
        toggleMute={toggleMute}
        openTemplates={() => setIsTemplateModalOpen(true)}
        openExportModal={() => setIsExportModalOpen(true)}
        openSocialPreview={() => setIsSocialPreviewOpen(true)}
        resetProject={resetProject}
        projectTitle={project.title}
        setProjectTitle={(title) => setProject((p) => ({ ...p, title }))}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Real-time Canvas Player */}
        <div className="lg:col-span-5 flex flex-col items-center sticky top-20">
          <PreviewPlayer
            project={project}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            isMuted={isMuted}
            toggleMute={toggleMute}
            activeSceneIndex={activeSceneIndex}
          />
        </div>

        {/* Right Column: Timeline & Scene Editors */}
        <div className="lg:col-span-7 space-y-4 w-full">
          {/* Scene Sequence Timeline */}
          <Timeline
            scenes={project.scenes}
            activeSceneIndex={activeSceneIndex}
            setActiveSceneIndex={setActiveSceneIndex}
            addScene={addScene}
            deleteScene={deleteScene}
            duplicateScene={duplicateScene}
            moveScene={moveScene}
            openTransitionModal={(idx) => {
              setTransitionSceneIndex(idx);
              setIsTransitionModalOpen(true);
            }}
            openTrimModal={(idx) => {
              setTrimSceneIndex(idx);
              setIsTrimModalOpen(true);
            }}
            openStockModal={() => setIsStockModalOpen(true)}
          />

          {/* Editor Tabs Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-[#1E293B] rounded-2xl border border-slate-700 shadow-lg">
            <button
              onClick={() => setActiveTab('scene')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeTab === 'scene'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 border border-violet-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-4 h-4 text-pink-400" />
              <span>Proprietà Scena</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeTab === 'text'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 border border-violet-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Type className="w-4 h-4 text-amber-400" />
              <span>Testi ({activeScene?.textOverlays?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeTab === 'audio'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 border border-violet-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Music className="w-4 h-4 text-cyan-400" />
              <span>Musica & SFX</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          {activeTab === 'scene' && activeScene && (
            <SceneEditor
              scene={activeScene}
              sceneIndex={activeSceneIndex}
              totalScenes={project.scenes.length}
              updateScene={updateScene}
              openTrimModal={(idx) => {
                setTrimSceneIndex(idx);
                setIsTrimModalOpen(true);
              }}
            />
          )}

          {activeTab === 'text' && activeScene && (
            <TextEditor
              scene={activeScene}
              sceneIndex={activeSceneIndex}
              updateScene={updateScene}
            />
          )}

          {activeTab === 'audio' && (
            <AudioEditor
              audioTracks={project.audioTracks}
              soundEffects={project.soundEffects}
              scenes={project.scenes}
              setAudioTracks={(tracks) =>
                setProject((prev) => ({
                  ...prev,
                  audioTracks: typeof tracks === 'function' ? tracks(prev.audioTracks) : tracks,
                }))
              }
              setSoundEffects={(sfx) =>
                setProject((prev) => ({
                  ...prev,
                  soundEffects: typeof sfx === 'function' ? sfx(prev.soundEffects) : sfx,
                }))
              }
              totalDuration={totalDuration}
            />
          )}
        </div>
      </main>

      {/* Modals & Drawers */}
      <TrimModal
        scene={project.scenes[trimSceneIndex] || activeScene}
        sceneIndex={trimSceneIndex}
        isOpen={isTrimModalOpen}
        onClose={() => setIsTrimModalOpen(false)}
        onSave={handleSaveTrim}
      />

      <TransitionPicker
        isOpen={isTransitionModalOpen}
        onClose={() => setIsTransitionModalOpen(false)}
        scene={project.scenes[transitionSceneIndex]}
        sceneIndex={transitionSceneIndex}
        onSelectTransition={handleSelectTransition}
      />

      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSelectPhoto={(url, name) => addScene('image', url)}
        onSelectColor={(color) => addScene('color', color)}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={loadTemplate}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
      />

      <SocialPreviewModal
        isOpen={isSocialPreviewOpen}
        onClose={() => setIsSocialPreviewOpen(false)}
        project={project}
      />
    </div>
  );
}
