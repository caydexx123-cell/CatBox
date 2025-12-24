import { CANVAS_SIZE } from '../types';

export const exportToVideo = async (frames: string[], fps: number): Promise<string | null> => {
  if (frames.length === 0) return null;

  // 1. Setup hidden container (Force browser to render it)
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '2px';
  container.style.height = '2px';
  container.style.overflow = 'hidden';
  container.style.opacity = '0.01'; 
  container.style.zIndex = '-9999';
  container.style.background = '#fff'; 
  document.body.appendChild(container);

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  canvas.style.width = `${CANVAS_SIZE}px`;
  canvas.style.height = `${CANVAS_SIZE}px`;
  container.appendChild(canvas);
  
  const ctx = canvas.getContext('2d', { 
    willReadFrequently: true,
    alpha: false // Force opaque
  });
  
  if (!ctx) {
      document.body.removeChild(container);
      return null;
  }

  // 2. Determine frames to record
  // If animation is too short (< 2 seconds), loop it so the video file is playable.
  // 2 seconds * fps = minimum frames needed
  const minFrames = Math.max(fps * 2, frames.length);
  let exportFrames = [...frames];
  
  if (exportFrames.length < minFrames) {
      while (exportFrames.length < minFrames) {
          exportFrames = [...exportFrames, ...frames];
      }
  }

  // 3. Helper: Draw Frame with Preloading (Fixes White Flash)
  const drawFrame = (frameData: string) => {
    return new Promise<void>((resolve) => {
      if (!frameData || frameData.length < 100) {
        // Blank frame
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        resolve();
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous"; 
      
      img.onload = () => {
        // CRITICAL FIX: Only clear and draw once image is READY.
        // Prevents recording the split-second white screen while loading.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        resolve();
      };
      
      img.onerror = () => {
        // Fallback for broken image
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        resolve();
      };

      img.src = frameData;
    });
  };

  // 4. Setup Recorder
  let mimeType = 'video/mp4';
  if (!MediaRecorder.isTypeSupported('video/mp4')) {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
         mimeType = 'video/webm;codecs=h264';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
         mimeType = 'video/webm';
      }
  }

  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: mimeType,
    videoBitsPerSecond: 8000000 // High quality
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise(async (resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: chunks[0]?.type || mimeType });
      const url = URL.createObjectURL(blob);
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      resolve(url);
    };

    // Pre-draw first frame so stream is not empty at start
    if (exportFrames.length > 0) {
        await drawFrame(exportFrames[0]);
    }

    mediaRecorder.start();

    const frameDuration = 1000 / fps;

    for (let i = 0; i < exportFrames.length; i++) {
        await drawFrame(exportFrames[i]);
        // Wait exactly frame duration
        await new Promise(r => setTimeout(r, frameDuration));
    }
    
    // Tiny buffer at end to ensure last frame writes
    await new Promise(r => setTimeout(r, 100));

    mediaRecorder.stop();
  });
};