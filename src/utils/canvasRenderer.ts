import { Project, Scene, TextOverlay, StickerOverlay, TransitionType, FilterType, AspectRatio } from '../types';

export class CanvasRenderer {
  private mediaCache: Map<string, HTMLImageElement | HTMLVideoElement> = new Map();
  private loadingUrls: Set<string> = new Set();

  public getCanvasDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
    switch (aspectRatio) {
      case '9:16':
        return { width: 1080, height: 1920 };
      case '1:1':
        return { width: 1080, height: 1080 };
      case '4:5':
        return { width: 1080, height: 1350 };
      case '16:9':
        return { width: 1920, height: 1080 };
      default:
        return { width: 1080, height: 1920 };
    }
  }

  // Preload image or video element for smooth canvas drawing
  public getMediaElement(url: string, mediaType: 'image' | 'video'): HTMLImageElement | HTMLVideoElement | null {
    if (!url) return null;
    if (this.mediaCache.has(url)) {
      return this.mediaCache.get(url)!;
    }

    if (this.loadingUrls.has(url)) return null;
    this.loadingUrls.add(url);

    if (mediaType === 'image') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        this.mediaCache.set(url, img);
        this.loadingUrls.delete(url);
      };
      img.onerror = () => {
        this.loadingUrls.delete(url);
      };
      return null;
    } else {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.onloadeddata = () => {
        this.mediaCache.set(url, video);
        this.loadingUrls.delete(url);
      };
      video.onerror = () => {
        this.loadingUrls.delete(url);
      };
      return null;
    }
  }

  // Calculate global timeline total duration
  public getTotalDuration(scenes: Scene[]): number {
    if (scenes.length === 0) return 0;
    return scenes.reduce((acc, scene) => acc + scene.duration, 0);
  }

  // Render complete frame at specific timestamp
  public renderFrame(
    ctx: CanvasRenderingContext2D,
    project: Project,
    currentTime: number,
    width: number,
    height: number
  ) {
    ctx.clearRect(0, 0, width, height);

    if (project.scenes.length === 0) {
      this.drawPlaceholderBackground(ctx, width, height, 'No Scenes Added');
      return;
    }

    // Find current scene and transition state
    let sceneStartTime = 0;
    let activeSceneIndex = -1;
    let activeSceneTime = 0;

    for (let i = 0; i < project.scenes.length; i++) {
      const scene = project.scenes[i];
      const sceneEndTime = sceneStartTime + scene.duration;

      if (currentTime >= sceneStartTime && currentTime <= sceneEndTime) {
        activeSceneIndex = i;
        activeSceneTime = currentTime - sceneStartTime;
        break;
      }
      sceneStartTime = sceneEndTime;
    }

    if (activeSceneIndex === -1) {
      // Past end, pick last scene
      activeSceneIndex = project.scenes.length - 1;
      let sum = 0;
      for (let i = 0; i < activeSceneIndex; i++) sum += project.scenes[i].duration;
      sceneStartTime = sum;
      activeSceneTime = project.scenes[activeSceneIndex].duration;
    }

    const currentScene = project.scenes[activeSceneIndex];
    const nextScene = activeSceneIndex < project.scenes.length - 1 ? project.scenes[activeSceneIndex + 1] : null;

    const transition = currentScene.transition;
    const transitionDuration = transition?.duration || 0;
    const timeRemainingInScene = currentScene.duration - activeSceneTime;

    const isInTransition = nextScene && transition && transition.type !== 'none' && timeRemainingInScene <= transitionDuration;

    if (isInTransition && nextScene) {
      // We are in a transition zone between currentScene and nextScene!
      const transitionProgress = 1 - (timeRemainingInScene / transitionDuration); // 0 to 1

      this.renderTransition(
        ctx,
        currentScene,
        nextScene,
        transition.type,
        transitionProgress,
        activeSceneTime,
        0, // next scene starts at 0
        width,
        height
      );
    } else {
      // Draw single scene
      this.drawSingleScene(ctx, currentScene, activeSceneTime, width, height, 1.0);
    }

    // Draw Global Filters
    if (project.globalFilter && project.globalFilter !== 'none') {
      const globalCss = this.getCssFilterString(100, 100, 100, project.globalFilter);
      if (globalCss !== 'brightness(100%) contrast(100%) saturate(100%)') {
        ctx.save();
        ctx.filter = globalCss;
        ctx.drawImage(ctx.canvas, 0, 0);
        ctx.restore();
      }
      this.applyFilterEffect(ctx, project.globalFilter, width, height);
    }

    // Draw Animated Progress Bar
    if (project.showProgressBar) {
      this.drawProgressBar(ctx, currentTime, this.getTotalDuration(project.scenes), width, height);
    }
  }

  // Generate CSS filter string combining brightness, contrast, saturation, and filter presets
  private drawColorOrGradientBackground(
    ctx: CanvasRenderingContext2D,
    colorFill: string,
    width: number,
    height: number
  ) {
    if (!colorFill) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    if (colorFill.includes('gradient')) {
      const matches = colorFill.match(/(#(?:[0-9a-fA-F]{3}){1,2}|rgba?\([^)]+\))/g);
      if (matches && matches.length >= 2) {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        matches.forEach((col, idx) => {
          const stop = idx / (matches.length - 1);
          try {
            grad.addColorStop(stop, col);
          } catch {
            // ignore
          }
        });
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        return;
      }
    }

    try {
      ctx.fillStyle = colorFill;
      ctx.fillRect(0, 0, width, height);
    } catch {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }
  }

  private getCssFilterString(
    brightness: number = 100,
    contrast: number = 100,
    saturation: number = 100,
    filterType?: FilterType
  ): string {
    let base = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    if (!filterType || filterType === 'none') {
      return base;
    }

    switch (filterType) {
      case 'bw':
        return `${base} grayscale(100%) contrast(135%)`;
      case 'vintage':
        return `${base} sepia(75%) contrast(110%) brightness(90%) hue-rotate(-15deg)`;
      case 'cyberpunk':
        return `${base} hue-rotate(180deg) saturate(230%) contrast(135%)`;
      case 'tiktok-warm':
        return `${base} sepia(35%) saturate(150%) brightness(108%)`;
      case 'sunset':
        return `${base} hue-rotate(-25deg) saturate(180%) contrast(115%) brightness(105%)`;
      case 'vignette':
        return `${base} contrast(125%) brightness(95%)`;
      default:
        return base;
    }
  }

  // Draw single scene with filters, media, text overlays & stickers
  private drawSingleScene(
    ctx: CanvasRenderingContext2D,
    scene: Scene,
    sceneTime: number,
    width: number,
    height: number,
    alpha: number = 1.0
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;

    // Apply color adjustments & scene filter preset directly to background media
    ctx.filter = this.getCssFilterString(scene.brightness, scene.contrast, scene.saturation, scene.filter);

    // 1. Draw Media Background
    this.drawColorOrGradientBackground(ctx, scene.colorFill || '#0f172a', width, height);

    if (scene.mediaType !== 'color' && scene.mediaUrl) {
      const media = this.getMediaElement(scene.mediaUrl, scene.mediaType);
      if (media) {
        this.drawMediaToCanvas(ctx, media, scene, width, height);
      }
    }

    // Reset filter for text & stickers so text stays crisp
    ctx.filter = 'none';

    // 2. Apply Scene Filter Effect
    if (scene.filter && scene.filter !== 'none') {
      this.applyFilterEffect(ctx, scene.filter, width, height);
    }

    // 3. Draw Text Overlays
    scene.textOverlays.forEach((textOverlay) => {
      this.drawTextOverlay(ctx, textOverlay, sceneTime, scene.duration, width, height);
    });

    // 4. Draw Stickers & Badges
    scene.stickers.forEach((sticker) => {
      this.drawStickerOverlay(ctx, sticker, sceneTime, scene.duration, width, height);
    });

    ctx.restore();
  }

  // Draw Media Element with Cover, Contain, or Custom Scale & Pan
  private drawMediaToCanvas(
    ctx: CanvasRenderingContext2D,
    media: HTMLImageElement | HTMLVideoElement,
    scene: Scene,
    canvasW: number,
    canvasH: number
  ) {
    let sourceW = 0;
    let sourceH = 0;

    if (media instanceof HTMLImageElement) {
      sourceW = media.naturalWidth || 1080;
      sourceH = media.naturalHeight || 1920;
    } else if (media instanceof HTMLVideoElement) {
      sourceW = media.videoWidth || 1080;
      sourceH = media.videoHeight || 1920;

      // Sync video playback timestamp
      const targetVideoTime = (scene.startTime || 0) + scene.panY; // use startTime for offset
      if (Math.abs(media.currentTime - targetVideoTime) > 0.15) {
        media.currentTime = targetVideoTime;
      }
    }

    if (sourceW === 0 || sourceH === 0) return;

    ctx.save();

    const fitMode = scene.fitMode || 'cover';
    const zoom = scene.zoom || 1.0;
    const panX = ((scene.panX || 0) / 100) * (canvasW * 0.3);
    const panY = ((scene.panY || 0) / 100) * (canvasH * 0.3);

    let drawW = canvasW;
    let drawH = canvasH;
    let drawX = 0;
    let drawY = 0;

    const canvasAspect = canvasW / canvasH;
    const mediaAspect = sourceW / sourceH;

    if (fitMode === 'cover') {
      if (mediaAspect > canvasAspect) {
        drawH = canvasH;
        drawW = canvasH * mediaAspect;
      } else {
        drawW = canvasW;
        drawH = canvasW / mediaAspect;
      }
    } else if (fitMode === 'contain') {
      if (mediaAspect > canvasAspect) {
        drawW = canvasW;
        drawH = canvasW / mediaAspect;
      } else {
        drawH = canvasH;
        drawW = canvasH * mediaAspect;
      }
    }

    // Apply Zoom & Pan
    drawW *= zoom;
    drawH *= zoom;

    drawX = (canvasW - drawW) / 2 + panX;
    drawY = (canvasH - drawH) / 2 + panY;

    // Draw dark background under contain mode
    if (fitMode === 'contain') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasW, canvasH);
    }

    ctx.drawImage(media, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  // Render transitions between Scene A and Scene B
  private renderTransition(
    ctx: CanvasRenderingContext2D,
    sceneA: Scene,
    sceneB: Scene,
    type: TransitionType,
    progress: number, // 0.0 to 1.0
    sceneATime: number,
    sceneBTime: number,
    width: number,
    height: number
  ) {
    const p = Math.max(0, Math.min(1, progress));

    switch (type) {
      case 'fade': {
        this.drawSingleScene(ctx, sceneA, sceneATime, width, height, 1 - p);
        this.drawSingleScene(ctx, sceneB, sceneBTime, width, height, p);
        break;
      }

      case 'slide-left': {
        ctx.save();
        this.drawSingleScene(ctx, sceneA, sceneATime, width, height, 1.0);
        ctx.translate(-width * p, 0);
        // Draw scene B sliding in from right
        ctx.restore();
        ctx.save();
        ctx.translate(width * (1 - p), 0);
        this.drawSingleScene(ctx, sceneB, sceneBTime, width, height, 1.0);
        ctx.restore();
        break;
      }

      case 'slide-right': {
        ctx.save();
        this.drawSingleScene(ctx, sceneA, sceneATime, width, height, 1.0);
        ctx.restore();
        ctx.save();
        ctx.translate(-width * (1 - p), 0);
        this.drawSingleScene(ctx, sceneB, sceneBTime, width, height, 1.0);
        ctx.restore();
        break;
      }

      case 'slide-up': {
        ctx.save();
        this.drawSingleScene(ctx, sceneA, sceneATime, width, height, 1.0);
        ctx.restore();
        ctx.save();
        ctx.translate(0, height * (1 - p));
        this.drawSingleScene(ctx, sceneB, sceneBTime, width, height, 1.0);
        ctx.restore();
        break;
      }

      case 'slide-down': {
        ctx.save();
        this.drawSingleScene(ctx, sceneA, sceneATime, width, height, 1.0);
        ctx.restore();
        ctx.save();
        ctx.translate(0, -height * (1 - p));
        this.drawSingleScene(ctx, sceneB, sceneBTime, width, height, 1.0);
        ctx.restore();
        break;
      }

      case 'zoom-in': {
        this.drawSingleScene(ctx, sceneA, sceneATime, width, height, 1 - p);
        ctx.save();
        const scale = 0.5 + 0.5 * p;
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2, -height / 2);
        this.drawSingleScene(ctx, sceneB, sceneBTime, width, height, p);
        ctx.restore();
        break;
      }

      case 'zoom-out': {
        this.drawSingleScene(ctx, sceneA, sceneATime, width, height, 1 - p);
        ctx.save();
        const scale = 1.5 - 0.5 * p;
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2, -height / 2);
        this.drawSingleScene(ctx, sceneB, sceneBTime, width, height, p);
        ctx.restore();
        break;
      }

      case 'wipe': {
        this.drawSingleScene(ctx, sceneA, sceneATime, width, height, 1.0);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width * p, height);
        ctx.clip();
        this.drawSingleScene(ctx, sceneB, sceneBTime, width, height, 1.0);
        ctx.restore();
        break;
      }

      case 'glitch': {
        this.drawSingleScene(ctx, sceneA, sceneATime, width, height, 1 - p);
        ctx.save();
        // Random horizontal slice glitches
        const slices = 8;
        const sliceH = height / slices;
        for (let i = 0; i < slices; i++) {
          const offsetX = (Math.random() - 0.5) * 80 * (1 - p);
          ctx.drawImage(ctx.canvas, 0, i * sliceH, width, sliceH, offsetX, i * sliceH, width, sliceH);
        }
        this.drawSingleScene(ctx, sceneB, sceneBTime, width, height, p);
        ctx.restore();
        break;
      }

      case 'flash': {
        this.drawSingleScene(ctx, sceneA, sceneATime, width, height, 1 - p);
        this.drawSingleScene(ctx, sceneB, sceneBTime, width, height, p);
        // Flash bright white in center of transition
        const flashAlpha = 1 - Math.abs(p - 0.5) * 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.9})`;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      default: {
        this.drawSingleScene(ctx, sceneB, sceneBTime, width, height, 1.0);
        break;
      }
    }
  }

  // Draw TikTok & Reels Styled Text Overlays
  private drawTextOverlay(
    ctx: CanvasRenderingContext2D,
    textOverlay: TextOverlay,
    sceneTime: number,
    sceneDuration: number,
    canvasW: number,
    canvasH: number
  ) {
    const textStart = textOverlay.startTime;
    const textEnd = textStart + textOverlay.duration;

    if (sceneTime < textStart || sceneTime > textEnd) return;

    const overlayTime = sceneTime - textStart;
    const animProgress = Math.min(1, overlayTime / 0.3); // 300ms animation entry

    let textToDisplay = textOverlay.text;
    if (textOverlay.animation === 'typewriter') {
      const charCount = Math.floor((overlayTime / textOverlay.duration) * textOverlay.text.length * 1.8);
      textToDisplay = textOverlay.text.slice(0, Math.max(1, charCount));
    }

    ctx.save();

    // Position coordinates
    const posX = (textOverlay.position.x / 100) * canvasW;
    let posY = (textOverlay.position.y / 100) * canvasH;

    // Apply Entry Animations
    let alpha = 1.0;
    let scale = 1.0;

    switch (textOverlay.animation) {
      case 'fade':
        alpha = animProgress;
        break;
      case 'pop':
        scale = 0.3 + 0.7 * Math.sin((animProgress * Math.PI) / 2);
        break;
      case 'slide-up':
        posY += (1 - animProgress) * 50;
        alpha = animProgress;
        break;
      case 'pulse':
        scale = 1.0 + 0.05 * Math.sin(sceneTime * 8);
        break;
    }

    ctx.globalAlpha = alpha;
    ctx.translate(posX, posY);
    ctx.scale(scale, scale);

    if (textOverlay.rotation) {
      ctx.rotate((textOverlay.rotation * Math.PI) / 180);
    }

    // Set Font - Boosted font scaling so text overlays are big, bold and readable on 9:16 vertical videos
    const scaledFontSize = Math.max(14, (textOverlay.fontSize * 1.65 / 1080) * canvasW);
    ctx.font = `800 ${scaledFontSize}px '${textOverlay.fontFamily || 'Montserrat'}', sans-serif`;
    ctx.textAlign = textOverlay.align || 'center';
    ctx.textBaseline = 'middle';

    // Calculate text box padding & metrics
    const metrics = ctx.measureText(textToDisplay);
    const textW = metrics.width;
    const textH = scaledFontSize * 1.3;
    const padX = scaledFontSize * 0.5;
    const padY = scaledFontSize * 0.25;

    // Draw TikTok Style background pills & neon boxes
    switch (textOverlay.style) {
      case 'tiktok-yellow': {
        // Bright yellow highlight pill with black text
        ctx.fillStyle = textOverlay.backgroundColor || '#facc15';
        ctx.beginPath();
        const boxX = textOverlay.align === 'center' ? -textW / 2 - padX : textOverlay.align === 'right' ? -textW - padX * 2 : -padX;
        this.roundRect(ctx, boxX, -textH / 2 - padY, textW + padX * 2, textH + padY * 2, 12);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.fillText(textToDisplay, 0, 0);
        break;
      }

      case 'impact-box': {
        // Solid colored rounded box
        ctx.fillStyle = textOverlay.backgroundColor || '#ef4444';
        const boxX = textOverlay.align === 'center' ? -textW / 2 - padX : textOverlay.align === 'right' ? -textW - padX * 2 : -padX;
        ctx.fillRect(boxX, -textH / 2 - padY, textW + padX * 2, textH + padY * 2);

        ctx.fillStyle = textOverlay.color || '#ffffff';
        ctx.fillText(textToDisplay, 0, 0);
        break;
      }

      case 'neon': {
        // Glowing Neon text with shadow blur
        ctx.shadowColor = textOverlay.color || '#38bdf8';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(textToDisplay, 0, 0);

        ctx.shadowBlur = 10;
        ctx.fillText(textToDisplay, 0, 0);
        break;
      }

      case 'aesthetic': {
        // Elegant translucent glass pill
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        const boxX = textOverlay.align === 'center' ? -textW / 2 - padX : textOverlay.align === 'right' ? -textW - padX * 2 : -padX;
        this.roundRect(ctx, boxX, -textH / 2 - padY, textW + padX * 2, textH + padY * 2, 20);
        ctx.fill();

        ctx.fillStyle = textOverlay.color || '#ffffff';
        ctx.fillText(textToDisplay, 0, 0);
        break;
      }

      case 'classic':
      default: {
        // Classic white text with dark outline stroke
        ctx.lineWidth = scaledFontSize * 0.15;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(textToDisplay, 0, 0);

        ctx.fillStyle = textOverlay.color || '#ffffff';
        ctx.fillText(textToDisplay, 0, 0);
        break;
      }
    }

    ctx.restore();
  }

  // Draw Social Media Badges & Stickers
  private drawStickerOverlay(
    ctx: CanvasRenderingContext2D,
    sticker: StickerOverlay,
    sceneTime: number,
    sceneDuration: number,
    canvasW: number,
    canvasH: number
  ) {
    if (sceneTime < sticker.startTime || sceneTime > sticker.startTime + sticker.duration) return;

    ctx.save();
    const posX = (sticker.position.x / 100) * canvasW;
    const posY = (sticker.position.y / 100) * canvasH;

    ctx.translate(posX, posY);
    ctx.scale(sticker.scale || 1.0, sticker.scale || 1.0);

    ctx.font = `800 24px 'Montserrat', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (sticker.type) {
      case 'follow': {
        // Red TikTok "Follow +" button badge
        ctx.fillStyle = '#ef4444';
        this.roundRect(ctx, -90, -22, 180, 44, 22);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Segui +', 0, 0);
        break;
      }

      case 'sound-on': {
        // Black pill "Sound On 🔊"
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.roundRect(ctx, -80, -20, 160, 40, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Audio On 🔊', 0, 0);
        break;
      }

      case 'shop-now': {
        // Cyan vibrant "Shop Now 🛍️" badge
        ctx.fillStyle = '#06b6d4';
        this.roundRect(ctx, -85, -22, 170, 44, 12);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Acquista 🛍️', 0, 0);
        break;
      }

      case 'like-share': {
        // Pink "Like & Share ❤️"
        ctx.fillStyle = '#ec4899';
        this.roundRect(ctx, -95, -22, 190, 44, 22);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Lascia Un Like ❤️', 0, 0);
        break;
      }

      case 'part-1': {
        // Black sticker "Parte 1 ➡️"
        ctx.fillStyle = '#1e293b';
        this.roundRect(ctx, -70, -18, 140, 36, 10);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.fillText('Parte 1 ➡️', 0, 0);
        break;
      }

      case 'emoji-fire': {
        ctx.font = '48px sans-serif';
        ctx.fillText('🔥', 0, 0);
        break;
      }

      case 'emoji-heart': {
        ctx.font = '48px sans-serif';
        ctx.fillText('❤️', 0, 0);
        break;
      }
    }

    ctx.restore();
  }

  // Draw TikTok & Instagram Story style progress bar at top of video
  private drawProgressBar(
    ctx: CanvasRenderingContext2D,
    currentTime: number,
    totalDuration: number,
    width: number,
    height: number
  ) {
    if (totalDuration <= 0) return;
    const progress = Math.min(1, currentTime / totalDuration);

    ctx.save();
    // Top progress bar track
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(20, 16, width - 40, 6);

    // Active progress fill
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 16, (width - 40) * progress, 6);
    ctx.restore();
  }

  // Filter presets overlay gradients (Cyberpunk, Vintage, B&W, Warm, Sunset, Vignette)
  private applyFilterEffect(
    ctx: CanvasRenderingContext2D,
    filter: FilterType,
    width: number,
    height: number
  ) {
    ctx.save();
    switch (filter) {
      case 'tiktok-warm': {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(251, 146, 60, 0.18)'); // warm peach glow
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.12)'); // pink glow
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'cyberpunk': {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(217, 70, 239, 0.20)'); // neon magenta
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.20)'); // cyan
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'vintage': {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.15)'; // warm sepia film tint
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'bw': {
        // High contrast subtle vignette border for B&W
        const gradient = ctx.createRadialGradient(width / 2, height / 2, width * 0.4, width / 2, height / 2, width * 0.75);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'sunset': {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(236, 72, 153, 0.22)'); // pink top
        gradient.addColorStop(1, 'rgba(249, 115, 22, 0.25)'); // golden orange bottom
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'vignette': {
        const gradient = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.75);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
      }
    }
    ctx.restore();
  }

  // Helper for drawing rounded rectangles on Canvas
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private drawPlaceholderBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    label: string
  ) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#334155';
    ctx.font = '600 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, width / 2, height / 2);
  }
}

export const canvasRenderer = new CanvasRenderer();
