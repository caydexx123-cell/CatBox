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
  optimizeFps?: boolean; // Kept for prop compatibility but logic disabled for stability
}

export interface CanvasEditorHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  getSnapshot: () => Promise<string>;
}

const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(({
  currentFrameData,
  previousFrameData,
  onionSkinEnabled,
  drawingState,
  onUpdateFrame,
  isInteracting,
  isPlaying = false,
  optimizeFps = false
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // History Management
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    undo: () => {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        loadFromHistory(history[newIndex]);
      } else if (historyIndex === 0) {
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
        setIsDrawing(false);
        lastPos.current = null;
        setHistory([]);
        setHistoryIndex(-1);
        onUpdateFrame(''); 
    },
    getSnapshot: async () => {
        const canvas = canvasRef.current;
        if (!canvas) return '';
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = CANVAS_SIZE;
        tempCanvas.height = CANVAS_SIZE;
        const tCtx = tempCanvas.getContext('2d');
        if (!tCtx) return '';

        // 1. Fill White
        tCtx.fillStyle = '#ffffff';
        tCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // 2. Draw current canvas on top
        tCtx.drawImage(canvas, 0, 0);

        return tempCanvas.toDataURL('image/png'); // High quality PNG
    }
  }));

  const saveToHistory = (shouldUpdateParent = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);

    if (newHistory.length > 20) newHistory.shift();

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    if (shouldUpdateParent) onUpdateFrame(dataUrl);
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

  // STABLE CONTEXT SETTINGS
  // Removed 'desynchronized' as it causes flickering on some Android/iOS devices
  const getContextOptions = (): CanvasRenderingContext2DSettings => {
      return { willReadFrequently: true, alpha: true };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', getContextOptions());
    if (!ctx) return;

    // Reset settings to ensure clean lines
    ctx.imageSmoothingEnabled = false; 

    if (!currentFrameData || currentFrameData.length === 0) {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        if (!isPlaying) {
             setHistory([]);
             setHistoryIndex(-1);
        }
        setIsLoadingImage(false);
        return;
    }

    const currentHistoryTip = historyIndex >= 0 ? history[historyIndex] : '';
    
    // Only redraw if data changed from outside (e.g. timeline switch)
    if (currentFrameData !== currentHistoryTip) {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        if (currentFrameData && currentFrameData.length > 10) {
            if (!isPlaying) setIsLoadingImage(true);
            
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
                const drawWidth = img.width * scale;
                const drawHeight = img.height * scale;
                const x = (CANVAS_SIZE - drawWidth) / 2;
                const y = (CANVAS_SIZE - drawHeight) / 2;

                ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                ctx.drawImage(img, x, y, drawWidth, drawHeight);
                setIsLoadingImage(false);
                
                if (!isPlaying) {
                    const newData = canvas.toDataURL();
                    // Sync history only if we loaded a fresh frame from timeline
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

    const ctx = canvas.getContext('2d', getContextOptions());
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
    // Draw a single dot
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

    const ctx = canvas.getContext('2d', getContextOptions()); 
    if (!ctx) return;

    // Use coalesced events for smoother curves if available
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];

    for (const event of events) {
        const { x, y } = getCoordinates(event, canvas);

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(x, y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = drawingState.brushSize;

        if (drawingState.tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = 'rgba(255,255,255,1)'; 
        } else {
          ctx.strokeStyle = drawingState.color;
        }

        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';

        lastPos.current = { x, y };
    }
  };

  const stopDrawing = () => {
    if (isDrawing) saveToHistory();
    setIsDrawing(false);
    isInteracting(false);
    lastPos.current = null;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center p-2 md:p-4">
      {/* Container maintains aspect ratio but respects parent bounds */}
      <div className="relative aspect-square w-full h-full max-w-[80vh] max-h-[80vh] shadow-2xl rounded-3xl overflow-hidden bg-white border-4 border-catbox-panel/50 flex-shrink-0">
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
    </div>
  );
});

export default CanvasEditor;