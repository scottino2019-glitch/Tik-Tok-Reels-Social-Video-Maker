import { Project, ExportSettings } from '../types';
import { canvasRenderer } from './canvasRenderer';
import { audioEngine } from './audioEngine';

export interface ExportProgress {
  status: 'preparing' | 'rendering' | 'encoding' | 'completed' | 'error';
  percent: number; // 0 to 100
  currentFrame: number;
  totalFrames: number;
  downloadUrl?: string;
  errorMessage?: string;
}

export class VideoExporter {
  public async exportVideo(
    project: Project,
    settings: ExportSettings,
    onProgress: (progress: ExportProgress) => void
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const totalDuration = canvasRenderer.getTotalDuration(project.scenes);
        if (totalDuration <= 0) {
          throw new Error('Impossibile esportare: nessuna scena presente nel progetto.');
        }

        const fps = settings.fps || 30;
        const totalFrames = Math.ceil(totalDuration * fps);

        onProgress({
          status: 'preparing',
          percent: 0,
          currentFrame: 0,
          totalFrames,
        });

        // Setup offscreen canvas
        let canvasWidth = 1080;
        let canvasHeight = 1920;

        switch (project.aspectRatio) {
          case '9:16':
            canvasWidth = settings.resolution === '1080p' ? 1080 : settings.resolution === '720p' ? 720 : 540;
            canvasHeight = Math.round(canvasWidth * (16 / 9));
            break;
          case '1:1':
            canvasWidth = settings.resolution === '1080p' ? 1080 : settings.resolution === '720p' ? 720 : 540;
            canvasHeight = canvasWidth;
            break;
          case '4:5':
            canvasWidth = settings.resolution === '1080p' ? 1080 : settings.resolution === '720p' ? 720 : 540;
            canvasHeight = Math.round(canvasWidth * (5 / 4));
            break;
          case '16:9':
            canvasHeight = settings.resolution === '1080p' ? 1080 : settings.resolution === '720p' ? 720 : 540;
            canvasWidth = Math.round(canvasHeight * (16 / 9));
            break;
        }

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvasWidth;
        exportCanvas.height = canvasHeight;
        const ctx = exportCanvas.getContext('2d');

        if (!ctx) {
          throw new Error('Impossibile inizializzare il contesto 2D Canvas per la registrazione.');
        }

        // Preload scene media elements
        for (const scene of project.scenes) {
          if (scene.mediaUrl && (scene.mediaType === 'image' || scene.mediaType === 'video')) {
            canvasRenderer.getMediaElement(scene.mediaUrl, scene.mediaType);
          }
        }
        await new Promise((r) => setTimeout(r, 300));

        // Start Audio Recording Stream from WebAudio
        audioEngine.resumeContext();
        const audioStream = audioEngine.startRecordingStream();

        // Capture Canvas Video Stream
        const canvasStream = exportCanvas.captureStream(fps);

        // Combine Video & Audio Tracks
        const combinedStream = new MediaStream();
        canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
        if (audioStream) {
          audioStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
        }

        const mimeType = this.getSupportedMimeType(settings.format);
        let mediaRecorder: MediaRecorder;

        try {
          mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType,
            videoBitsPerSecond: settings.quality === 'high' ? 8000000 : 4000000,
          });
        } catch {
          mediaRecorder = new MediaRecorder(combinedStream);
        }

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          audioEngine.stopRecordingStream();
          audioEngine.stopAll();

          onProgress({
            status: 'encoding',
            percent: 98,
            currentFrame: totalFrames,
            totalFrames,
          });

          const finalBlob = new Blob(chunks, { type: mimeType || 'video/webm' });
          const downloadUrl = URL.createObjectURL(finalBlob);

          onProgress({
            status: 'completed',
            percent: 100,
            currentFrame: totalFrames,
            totalFrames,
            downloadUrl,
          });

          resolve(downloadUrl);
        };

        mediaRecorder.start(100);

        // Real-time precise recording loop
        const startTime = performance.now();
        let prevTimelineTime = 0;
        let isStopped = false;

        const renderStep = () => {
          if (isStopped) return;

          const now = performance.now();
          const elapsed = (now - startTime) / 1000;
          const currentTimelineTime = Math.min(elapsed, totalDuration);

          // Render canvas frame
          canvasRenderer.renderFrame(ctx, project, currentTimelineTime, canvasWidth, canvasHeight);

          // Play Audio
          project.audioTracks.forEach((track) => {
            audioEngine.playAudioTrackAt(track, currentTimelineTime, true);
          });

          // Play Sound Effects
          audioEngine.playTimelineSoundEffects(project.soundEffects, currentTimelineTime, prevTimelineTime, true);

          prevTimelineTime = currentTimelineTime;

          const currentFrame = Math.min(totalFrames, Math.floor(currentTimelineTime * fps));
          const percent = Math.min(95, Math.round((currentTimelineTime / totalDuration) * 95));

          onProgress({
            status: 'rendering',
            percent,
            currentFrame,
            totalFrames,
          });

          if (elapsed < totalDuration) {
            requestAnimationFrame(renderStep);
          } else {
            isStopped = true;

            // Render absolute final frame
            canvasRenderer.renderFrame(ctx, project, totalDuration, canvasWidth, canvasHeight);
            audioEngine.stopAll();

            // Wait brief buffer to capture final frames
            setTimeout(() => {
              if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
              }
            }, 400);
          }
        };

        renderStep();
      } catch (err) {
        audioEngine.stopRecordingStream();
        audioEngine.stopAll();
        const errorMsg = err instanceof Error ? err.message : 'Errore durante la creazione del video.';
        onProgress({
          status: 'error',
          percent: 0,
          currentFrame: 0,
          totalFrames: 0,
          errorMessage: errorMsg,
        });
        reject(err);
      }
    });
  }

  private getSupportedMimeType(format: ExportSettings['format']): string {
    const typesMap: Record<string, string[]> = {
      mp4: [
        'video/mp4;codecs="avc1.42E01E, mp4a.40.2"',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ],
      webm: [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ],
      gif: ['video/webm'],
    };

    const candidates = typesMap[format] || typesMap.webm;
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }
}

export const videoExporter = new VideoExporter();
