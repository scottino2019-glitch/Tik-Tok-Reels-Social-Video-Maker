export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9';

export type TransitionType = 
  | 'none' 
  | 'fade' 
  | 'slide-left' 
  | 'slide-right' 
  | 'slide-up' 
  | 'slide-down' 
  | 'zoom-in' 
  | 'zoom-out' 
  | 'wipe' 
  | 'blur' 
  | 'glitch' 
  | 'flash';

export type FitMode = 'cover' | 'contain' | 'custom';

export type FilterType = 
  | 'none' 
  | 'tiktok-warm' 
  | 'cyberpunk' 
  | 'vintage' 
  | 'bw' 
  | 'pastel' 
  | 'sunset' 
  | 'vignette' 
  | 'glitch-filter';

export type TextStyle = 
  | 'classic' 
  | 'tiktok-yellow' 
  | 'neon' 
  | 'impact-box' 
  | 'aesthetic' 
  | 'clean';

export type TextAnimation = 
  | 'none' 
  | 'fade' 
  | 'pop' 
  | 'slide-up' 
  | 'typewriter' 
  | 'pulse';

export type StickerType = 
  | 'follow' 
  | 'sound-on' 
  | 'like-share' 
  | 'shop-now' 
  | 'part-1' 
  | 'new-post' 
  | 'emoji-fire' 
  | 'emoji-heart';

export interface TextOverlay {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number; // in relative px (scaled to canvas)
  color: string;
  backgroundColor?: string;
  style: TextStyle;
  animation: TextAnimation;
  position: { x: number; y: number }; // percentages 0 - 100
  align: 'left' | 'center' | 'right';
  startTime: number; // relative to scene start (0 to scene.duration)
  duration: number; // display duration in seconds
  rotation?: number; // degrees
}

export interface StickerOverlay {
  id: string;
  type: StickerType;
  customText?: string;
  position: { x: number; y: number }; // 0 - 100
  scale: number; // 0.5 to 2.0
  startTime: number;
  duration: number;
}

export interface SceneTransition {
  type: TransitionType;
  duration: number; // seconds, e.g. 0.5
}

export interface Scene {
  id: string;
  mediaType: 'image' | 'video' | 'color';
  mediaUrl: string;
  title?: string;
  colorFill?: string;
  duration: number; // scene duration in seconds
  mediaDuration?: number; // total duration of source video/media
  startTime?: number; // trim start time in source video
  endTime?: number; // trim end time in source video
  fitMode: FitMode;
  zoom: number; // 1.0 to 3.0
  panX: number; // -100 to 100
  panY: number; // -100 to 100
  transition: SceneTransition;
  textOverlays: TextOverlay[];
  stickers: StickerOverlay[];
  filter: FilterType;
  brightness: number; // 0 to 200, 100 default
  contrast: number; // 0 to 200, 100 default
  saturation: number; // 0 to 200, 100 default
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  isSynth?: boolean;
  synthPreset?: 'upbeat' | 'lofi' | 'synthwave' | 'cinematic' | 'pop' | 'acoustic';
  volume: number; // 0.0 to 1.0
  startTime: number; // global timeline offset in seconds
  audioStartOffset: number; // trim offset within the track
  duration: number; // duration on timeline in seconds
  totalDuration?: number; // track total source length
  fadeIn: boolean;
  fadeOut: boolean;
}

export interface SoundEffect {
  id: string;
  name: string;
  type: 'whoosh' | 'pop' | 'ding' | 'bass' | 'shutter' | 'scratch' | 'applause';
  triggerTime: number; // global timeline trigger time
  volume: number; // 0.0 to 1.0
}

export interface ExportSettings {
  format: 'webm' | 'mp4' | 'gif';
  resolution: '1080p' | '720p' | '540p';
  fps: 30 | 60;
  quality: 'high' | 'medium' | 'standard';
}

export interface Project {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  scenes: Scene[];
  audioTracks: AudioTrack[];
  soundEffects: SoundEffect[];
  globalFilter?: FilterType;
  showProgressBar: boolean;
}

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  tag: string;
  aspectRatio: AspectRatio;
  previewGradient: string;
  scenes: Omit<Scene, 'id'>[];
  audioTracks: Omit<AudioTrack, 'id'>[];
  soundEffects: Omit<SoundEffect, 'id'>[];
}
