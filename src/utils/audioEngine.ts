import { AudioTrack, SoundEffect } from '../types';

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private streamDestination: MediaStreamAudioDestinationNode | null = null;
  private isMuted: boolean = false;
  private activeAudioElements: Map<string, HTMLAudioElement> = new Map();
  private audioMediaSources: Map<string, MediaElementAudioSourceNode> = new Map();
  private lastStepTimes: Map<string, number> = new Map();

  private initCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getDestination(): AudioNode {
    this.initCtx();
    return this.masterGain || this.ctx!.destination;
  }

  public resumeContext() {
    this.initCtx();
  }

  public startRecordingStream(): MediaStream | null {
    const ctx = this.initCtx();
    if (!this.masterGain) return null;

    try {
      if (!this.streamDestination) {
        this.streamDestination = ctx.createMediaStreamDestination();
        this.masterGain.connect(this.streamDestination);
      }
      return this.streamDestination.stream;
    } catch (err) {
      console.warn('MediaStreamDestination creation error:', err);
      return null;
    }
  }

  public stopRecordingStream() {
    if (this.masterGain && this.streamDestination) {
      try {
        this.masterGain.disconnect(this.streamDestination);
      } catch {}
      this.streamDestination = null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAll();
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public stopAll() {
    this.activeAudioElements.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeAudioElements.clear();
    this.audioMediaSources.clear();
    this.lastStepTimes.clear();
  }

  // Play Sound Effects generated programmatically with Web Audio API!
  public playSoundEffect(effectType: SoundEffect['type'], volume: number = 0.8) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const dest = this.getDestination();
    const now = ctx.currentTime;
    const sfxGain = ctx.createGain();
    const finalVol = Math.max(0, Math.min(1, volume));
    sfxGain.gain.setValueAtTime(finalVol, now);
    sfxGain.connect(dest);

    switch (effectType) {
      case 'whoosh': {
        const bufferSize = Math.floor(ctx.sampleRate * 0.4);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(3, now);
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(finalVol, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);

        noise.start(now);
        noise.stop(now + 0.4);
        break;
      }

      case 'pop': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

        gain.gain.setValueAtTime(finalVol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(sfxGain);

        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case 'ding': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(1760, now); // A6
        osc2.frequency.setValueAtTime(2637, now); // E7

        gain.gain.setValueAtTime(finalVol * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(sfxGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.8);
        osc2.stop(now + 0.8);
        break;
      }

      case 'bass': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.5);

        gain.gain.setValueAtTime(finalVol * 1.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(sfxGain);

        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }

      case 'shutter': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

        gain.gain.setValueAtTime(finalVol * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(sfxGain);

        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'scratch': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
        osc.frequency.linearRampToValueAtTime(150, now + 0.25);

        gain.gain.setValueAtTime(finalVol * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(sfxGain);

        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case 'applause': {
        for (let i = 0; i < 6; i++) {
          const delay = i * 0.08;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400 + Math.random() * 600, now + delay);

          gain.gain.setValueAtTime(finalVol * 0.3, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

          osc.connect(gain);
          gain.connect(sfxGain);

          osc.start(now + delay);
          osc.stop(now + delay + 0.12);
        }
        break;
      }
    }
  }

  // Play or sync single audio track at current timeline time
  public playAudioTrackAt(track: AudioTrack, currentTime: number, isPlaying: boolean) {
    if (this.isMuted) return;

    if (track.isSynth) {
      this.playSynthTrackAt(track, currentTime, isPlaying);
      return;
    }

    if (!track.url) return;

    let audio = this.activeAudioElements.get(track.id);
    if (!audio) {
      audio = new Audio(track.url);
      audio.crossOrigin = 'anonymous';
      this.activeAudioElements.set(track.id, audio);

      if (this.ctx && this.masterGain) {
        try {
          const source = this.ctx.createMediaElementSource(audio);
          source.connect(this.masterGain);
          this.audioMediaSources.set(track.id, source);
        } catch {
          // Fallback if media source connect fails
        }
      }
    }

    const trackStart = track.startTime;
    const trackEnd = trackStart + track.duration;

    if (currentTime >= trackStart && currentTime <= trackEnd && isPlaying) {
      const targetAudioTime = (currentTime - trackStart) + track.audioStartOffset;

      let calculatedVol = track.volume;
      const posInTrack = currentTime - trackStart;
      const remainingInTrack = trackEnd - currentTime;

      if (track.fadeIn && posInTrack < 1.0) {
        calculatedVol *= Math.max(0, posInTrack / 1.0);
      }
      if (track.fadeOut && remainingInTrack < 1.0) {
        calculatedVol *= Math.max(0, remainingInTrack / 1.0);
      }

      audio.volume = Math.max(0, Math.min(1, calculatedVol));

      if (Math.abs(audio.currentTime - targetAudioTime) > 0.2) {
        audio.currentTime = targetAudioTime;
      }

      if (audio.paused) {
        audio.play().catch(() => {});
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }

  // Synthesize background musical beats & chords dynamically with Web Audio API
  private playSynthTrackAt(track: AudioTrack, currentTime: number, isPlaying: boolean) {
    if (!isPlaying || this.isMuted) {
      this.lastStepTimes.delete(track.id);
      return;
    }

    const trackStart = track.startTime;
    const trackEnd = trackStart + track.duration;
    if (currentTime < trackStart || currentTime > trackEnd) {
      this.lastStepTimes.delete(track.id);
      return;
    }

    const elapsed = currentTime - trackStart;
    const preset = track.synthPreset || 'upbeat';

    const bpm = preset === 'upbeat' ? 128 : preset === 'lofi' ? 84 : preset === 'synthwave' ? 115 : preset === 'pop' ? 120 : preset === 'cinematic' ? 90 : 105;
    const stepDuration = 60 / bpm / 4; // 16th note duration
    const currentStep = Math.floor(elapsed / stepDuration);
    const lastStep = this.lastStepTimes.get(track.id);

    if (lastStep === currentStep) {
      return; // Already processed this beat step
    }

    this.lastStepTimes.set(track.id, currentStep);

    // Fade calculations
    let volFactor = track.volume;
    if (track.fadeIn && elapsed < 1.0) {
      volFactor *= Math.max(0, elapsed / 1.0);
    }
    const remaining = trackEnd - currentTime;
    if (track.fadeOut && remaining < 1.0) {
      volFactor *= Math.max(0, remaining / 1.0);
    }

    const ctx = this.initCtx();
    const now = ctx.currentTime;

    switch (preset) {
      case 'upbeat': {
        // Kick on 0, 4, 8, 12
        if (currentStep % 4 === 0) {
          this.synthKick(ctx, now, volFactor * 0.9);
        }
        // Snare / Clap on 4, 12
        if (currentStep % 8 === 4) {
          this.synthSnare(ctx, now, volFactor * 0.7);
        }
        // Hihat on 2, 6, 10, 14
        if (currentStep % 2 === 0) {
          this.synthHiHat(ctx, now, volFactor * 0.4);
        }
        // Upbeat Bass / Chord pulse on quarter beats
        if (currentStep % 4 === 0) {
          const chordIndex = Math.floor(currentStep / 16) % 4;
          const chords = [
            [261.63, 329.63, 392.00], // C
            [220.00, 261.63, 329.63], // Am
            [174.61, 220.00, 261.63], // F
            [196.00, 246.94, 293.66], // G
          ];
          this.synthChord(ctx, now, chords[chordIndex], 'sawtooth', 0.2, volFactor * 0.35);
        }
        break;
      }

      case 'lofi': {
        // Kick on 0, 10
        if (currentStep % 16 === 0 || currentStep % 16 === 10) {
          this.synthKick(ctx, now, volFactor * 0.6, 90, 20);
        }
        // Soft Lofi Snare on 4, 12
        if (currentStep % 8 === 4) {
          this.synthSnare(ctx, now, volFactor * 0.4, 0.12);
        }
        // Jazz 7th Chord Pad every 16 steps
        if (currentStep % 16 === 0) {
          const chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [174.61, 220.00, 261.63, 329.63], // Fmaj7
            [196.00, 246.94, 293.66, 349.23], // G7
          ];
          const idx = Math.floor(currentStep / 16) % 4;
          this.synthChord(ctx, now, chords[idx], 'sine', 0.8, volFactor * 0.4);
        }
        break;
      }

      case 'synthwave': {
        // 80s Kick on 0, 4, 8, 12
        if (currentStep % 4 === 0) {
          this.synthKick(ctx, now, volFactor * 0.9, 160, 35);
        }
        // Gated Snare on 4, 12
        if (currentStep % 8 === 4) {
          this.synthSnare(ctx, now, volFactor * 0.8, 0.18);
        }
        // Driving Bassline on 8th notes
        if (currentStep % 2 === 0) {
          const bassNotes = [55.00, 65.41, 73.42, 82.41];
          const bNote = bassNotes[Math.floor(currentStep / 8) % 4];
          this.synthNote(ctx, now, bNote, 'sawtooth', 0.15, volFactor * 0.5);
        }
        // Arpeggiator note on every 16th
        const arpScale = [220.00, 261.63, 329.63, 440.00, 523.25];
        const arpNote = arpScale[currentStep % arpScale.length];
        this.synthNote(ctx, now, arpNote, 'sawtooth', 0.1, volFactor * 0.25);
        break;
      }

      case 'pop': {
        // Upbeat Pop Kick
        if (currentStep % 4 === 0) {
          this.synthKick(ctx, now, volFactor * 0.85);
        }
        // Bright Snare / Clap
        if (currentStep % 8 === 4) {
          this.synthSnare(ctx, now, volFactor * 0.7);
        }
        // Bright Pop Chords
        if (currentStep % 8 === 0 || currentStep % 8 === 3) {
          const chords = [
            [392.00, 493.88, 587.33], // G
            [329.63, 392.00, 493.88], // Em
            [261.63, 329.63, 392.00], // C
            [293.66, 369.99, 440.00], // D
          ];
          const idx = Math.floor(currentStep / 8) % 4;
          this.synthChord(ctx, now, chords[idx], 'triangle', 0.25, volFactor * 0.4);
        }
        break;
      }

      case 'cinematic': {
        // Low Brass / Sub Drone every 16 steps
        if (currentStep % 16 === 0) {
          this.synthNote(ctx, now, 65.41, 'sawtooth', 1.2, volFactor * 0.5); // C2
          this.synthNote(ctx, now, 98.00, 'triangle', 1.2, volFactor * 0.4); // G2
        }
        // Atmospheric Pad Swell
        if (currentStep % 16 === 0) {
          this.synthChord(ctx, now, [261.63, 392.00, 523.25], 'sine', 1.4, volFactor * 0.35);
        }
        break;
      }

      case 'acoustic': {
        // Acoustic Body Tap
        if (currentStep % 4 === 0) {
          this.synthKick(ctx, now, volFactor * 0.6, 110, 45);
        }
        // Plucked Acoustic Chords
        if (currentStep % 2 === 0) {
          const chords = [
            [196.00, 246.94, 293.66, 392.00], // G
            [164.81, 246.94, 329.63, 392.00], // Em
            [130.81, 196.00, 261.63, 329.63], // C
            [146.83, 220.00, 293.66, 369.99], // D
          ];
          const idx = Math.floor(currentStep / 8) % 4;
          this.synthChord(ctx, now, chords[idx], 'triangle', 0.2, volFactor * 0.45);
        }
        break;
      }
    }
  }

  // Helper synth instruments
  private synthKick(ctx: AudioContext, now: number, vol: number, startFreq = 140, endFreq = 25) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + 0.12);

    gain.gain.setValueAtTime(Math.max(0.001, vol), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.getDestination());
    osc.start(now);
    osc.stop(now + 0.12);
  }

  private synthSnare(ctx: AudioContext, now: number, vol: number, duration = 0.1) {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(Math.max(0.001, vol), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(gain);
    gain.connect(this.getDestination());
    noise.start(now);
    noise.stop(now + duration);
  }

  private synthHiHat(ctx: AudioContext, now: number, vol: number) {
    const duration = 0.04;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(Math.max(0.001, vol), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination());
    noise.start(now);
    noise.stop(now + duration);
  }

  private synthNote(ctx: AudioContext, now: number, freq: number, type: OscillatorType, duration: number, vol: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, vol), now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.getDestination());
    osc.start(now);
    osc.stop(now + duration);
  }

  private synthChord(ctx: AudioContext, now: number, freqs: number[], type: OscillatorType, duration: number, vol: number) {
    freqs.forEach((f) => {
      this.synthNote(ctx, now, f, type, duration, vol / freqs.length);
    });
  }

  // Trigger Sound Effects from timeline
  public playTimelineSoundEffects(soundEffects: SoundEffect[], currentTime: number, prevTime: number, isPlaying: boolean) {
    if (!isPlaying || this.isMuted || !soundEffects.length) return;

    soundEffects.forEach((sfx) => {
      const isStartInstant = prevTime === 0 && Math.abs(sfx.triggerTime) < 0.1;
      const passedWindow = prevTime < sfx.triggerTime && currentTime >= sfx.triggerTime;
      if (isStartInstant || passedWindow) {
        this.playSoundEffect(sfx.type, sfx.volume);
      }
    });
  }
}

export const audioEngine = new WebAudioEngine();
