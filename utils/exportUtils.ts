import { CANVAS_SIZE } from '../types';

export const exportToVideo = async (frames: string[], fps: number): Promise<string | null> => {
  if (frames.length === 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Helper to draw frame with white background to prevent "black screen" effect
  const drawFrame = (frameData: string) => {
    return new Promise<void>((resolve) => {
      // 1. Fill white background first (paper look)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // 2. If frame has data, draw it on top
      if (frameData && frameData.length > 100) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          resolve();
        };
        img.onerror = () => {
             // If image fails, just resolve with white background
             resolve();
        }
        img.src = frameData;
      } else {
          resolve();
      }
    });
  };

  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2500000 // Higher bitrate for quality
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise(async (resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      resolve(url);
    };

    mediaRecorder.start();

    // Loop through frames once to record
    for (const frame of frames) {
        await drawFrame(frame);
        // Wait for the duration of one frame precisely
        await new Promise(r => setTimeout(r, 1000 / fps));
    }

    mediaRecorder.stop();
  });
};