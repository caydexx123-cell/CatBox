import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { CANVAS_SIZE, DrawingState, ToolType } from '../types';
import { getCoordinates, floodFill } from '../utils/drawingUtils';
import { Icons } from './Icon';

interface CanvasEditorProps {
  currentFrameData: string | null;
  previousFrameData: string | null;
  onionSkinEnabled: boolean;
  drawingState: DrawingState;
  onUpdateFrame: (data: string) => void;
  isInteracting: (active: boolean) => void;
  isPlaying?: boolean;
}

export interface CanvasEditorHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(({
  currentFrameData,
  previousFrameData,
  onionSkinEnabled,
  drawingState,
  onUpdateFrame,
  isInteracting,
  isPlaying = false
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // History Management
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Expose undo/redo/clear to parent
  useImperativeHandle(ref, () => ({
    undo: () => {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        loadFromHistory(history[newIndex]);
      } else if (historyIndex === 0) {
        // Clear if at start
        setHistoryIndex(-1);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        onUpdateFrame('');
      }
    },
    redo: () => {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        loadFromHistory(history[newIndex]);
      }
    },
    clear: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        // Force reset interaction state
        setIsDrawing(false);
        lastPos.current = null;
        
        // Explicitly clear history and parent state
        setHistory([]);
        setHistoryIndex(-1);
        onUpdateFrame(''); // Send empty string to signify deleted frame
    }
  }));

  const saveToHistory = (shouldUpdateParent = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();

    // If we are in the middle of history and draw, cut off the future
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);

    // Limit history size for performance
    if (newHistory.length > 20) {
        newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    if (shouldUpdateParent) {
        onUpdateFrame(dataUrl);
    }
  };

  const loadFromHistory = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.drawImage(img, 0, 0);
        onUpdateFrame(dataUrl);
    };
    img.src = dataUrl;
  };

  // Initialize or update canvas when frame changes externally (e.g. timeline click)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Check if the incoming frame is empty
    if (!currentFrameData || currentFrameData.length === 0) {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        setHistory([]);
        setHistoryIndex(-1);
        setIsLoadingImage(false);
        return;
    }

    const currentHistoryTip = historyIndex >= 0 ? history[historyIndex] : '';
    
    // Check if frame changed and it's not the one we just drew (avoid loops)
    if (currentFrameData !== currentHistoryTip) {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (currentFrameData && currentFrameData.length > 10) {
            // Only show loader if NOT playing to prevent flicker
            if (!isPlaying) setIsLoadingImage(true);
            
            const img = new Image();
            img.onload = () => {
                // Contain Scale Logic
                const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
                const drawWidth = img.width * scale;
                const drawHeight = img.height * scale;
                const x = (CANVAS_SIZE - drawWidth) / 2;
                const y = (CANVAS_SIZE - drawHeight) / 2;

                ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                ctx.drawImage(img, x, y, drawWidth, drawHeight);
                setIsLoadingImage(false);
                
                // Initialize history with this frame if we stopped playing or just landed here
                if (!isPlaying) {
                    const newData = canvas.toDataURL();
                    setHistory([newData]);
                    setHistoryIndex(0);
                }
            };
            img.onerror = () => setIsLoadingImage(false);
            img.crossOrigin = "anonymous";
            img.src = currentFrameData;
        }
    }
  }, [currentFrameData, isPlaying]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    isInteracting(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);

    if (drawingState.tool === 'fill') {
      floodFill(ctx, x, y, drawingState.color);
      saveToHistory();
      setIsDrawing(false); 
      return;
    }

    lastPos.current = { x, y };

    ctx.beginPath();
    ctx.arc(x, y, drawingState.brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = drawingState.tool === 'eraser' ? '#ffffff' : drawingState.color;
    
    if (drawingState.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.fill();
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = drawingState.brushSize;

    if (drawingState.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)'; 
    } else {
      ctx.strokeStyle = drawingState.color;
    }

    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';

    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    if (isDrawing) {
      saveToHistory();
    }
    setIsDrawing(false);
    isInteracting(false);
    lastPos.current = null;
  };

  return (
    <div ref={containerRef} className="relative w-full aspect-square max-w-[500px] shadow-2xl rounded-3xl overflow-hidden bg-white border-4 border-catbox-panel/50">
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      />
      {isLoadingImage && !isPlaying && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
             <Icons.Sparkles className="animate-spin text-catbox-accent" size={32} />
          </div>
      )}
      {onionSkinEnabled && previousFrameData && (
        <img
          src={previousFrameData}
          alt="Onion Skin"
          className="absolute inset-0 w-full h-full z-10 pointer-events-none opacity-30 mix-blend-multiply filter grayscale object-contain"
        />
      )}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="absolute inset-0 w-full h-full z-20 touch-none cursor-crosshair"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />
    </div>
  );
});

export default CanvasEditor;