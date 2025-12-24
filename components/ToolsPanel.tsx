import React from 'react';
import { Icons } from './Icon';
import { DrawingState, ToolType, Language } from '../types';
import { translations } from '../utils/translations';

interface ToolsPanelProps {
  drawingState: DrawingState;
  setDrawingState: React.Dispatch<React.SetStateAction<DrawingState>>;
  onUndo: () => void;
  onRedo?: () => void;
  onClear: () => void;
  isPhotoMode?: boolean;
  onSave?: () => void;
  onOpenColorPicker: () => void;
  lang: Language;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ 
  drawingState, 
  setDrawingState, 
  onUndo,
  onRedo,
  onClear,
  isPhotoMode, 
  onSave,
  onOpenColorPicker,
  lang
}) => {
  const t = translations[lang];
  
  const updateTool = (tool: ToolType) => {
    setDrawingState(prev => ({ ...prev, tool }));
  };

  return (
    <div className="bg-catbox-panel/95 backdrop-blur-2xl border-t border-white/20 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] relative z-50 flex flex-col rounded-t-2xl overflow-hidden pb-[env(safe-area-inset-bottom)]">
      
      {/* Drag Handle */}
      <div className="w-full flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 bg-white/20 rounded-full"></div>
      </div>

      <div className="px-3 py-1 pb-4 space-y-2">
        
        {/* ROW 1: TOOLS & COLOR */}
        <div className="flex items-center gap-2 h-11">
            {/* Tools Group */}
            <div className="flex-1 grid grid-cols-3 gap-1 h-full">
                <button
                onClick={() => updateTool('brush')}
                className={`rounded-lg flex items-center justify-center gap-1 transition-all duration-200 border ${
                    drawingState.tool === 'brush' 
                    ? 'bg-catbox-accent border-white text-white shadow-md z-10' 
                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                    }`}
                >
                    <Icons.Pencil size={18} />
                </button>

                <button
                onClick={() => updateTool('eraser')}
                className={`rounded-lg flex items-center justify-center gap-1 transition-all duration-200 border ${
                    drawingState.tool === 'eraser' 
                    ? 'bg-white border-white text-black shadow-md z-10' 
                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                    }`}
                >
                    <Icons.Eraser size={18} />
                </button>

                <button
                onClick={() => updateTool('fill')}
                className={`rounded-lg flex items-center justify-center gap-1 transition-all duration-200 border ${
                    drawingState.tool === 'fill' 
                    ? 'bg-catbox-secondary border-white text-white shadow-md z-10' 
                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                    }`}
                >
                    <Icons.Fill size={18} />
                </button>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-white/10"></div>

            {/* Color Picker Button */}
            <button 
                onClick={onOpenColorPicker}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiM1NTUiLz48cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjNzc3Ii8+PHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzc3NyIvPjwvc3ZnPg==')] border-2 border-white/20 shrink-0 relative overflow-hidden active:scale-95 transition-transform shadow-md"
            >
                <div 
                    className="absolute inset-0 transition-all duration-300"
                    style={{ backgroundColor: drawingState.tool === 'eraser' ? '#ffffff' : drawingState.color }} 
                />
            </button>
        </div>

        {/* ROW 2: ACTIONS & SLIDER */}
        <div className="flex items-center gap-2 h-10">
            {/* Undo */}
            <button 
                onClick={onUndo}
                className="w-10 h-full rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white active:bg-white/10 active:scale-95"
            >
                <Icons.Undo size={16} />
            </button>

            {/* Photo Mode: Trash Can (Clear) */}
            {isPhotoMode && (
                <button 
                    onClick={onClear}
                    className="w-10 h-full rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 active:scale-95"
                >
                    <Icons.Trash size={16} />
                </button>
            )}

            {/* Slider container */}
            <div className="flex-1 flex items-center px-3 bg-black/20 rounded-lg border border-white/5 h-full relative">
                 {/* Visual Track */}
                 <div className="absolute left-3 right-3 h-1 bg-white/10 rounded-full top-1/2 -translate-y-1/2 overflow-hidden">
                     <div 
                        className="h-full bg-catbox-accent" 
                        style={{ width: `${(drawingState.brushSize / 80) * 100}%` }}
                     ></div>
                 </div>
                 
                 <input
                  type="range"
                  min="2"
                  max="80"
                  value={drawingState.brushSize}
                  onChange={(e) => setDrawingState(s => ({ ...s, brushSize: Number(e.target.value) }))}
                  className="w-full h-8 opacity-0 cursor-pointer relative z-10"
                />
                <span className="absolute right-2 -top-2 text-[8px] font-bold text-gray-400 bg-catbox-panel px-1 rounded border border-white/10 pointer-events-none">
                    {drawingState.brushSize}px
                </span>
            </div>

            {/* Redo */}
            <button 
                onClick={onRedo}
                className="w-10 h-full rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white active:bg-white/10 active:scale-95"
            >
                <Icons.Redo size={16} />
            </button>

            {/* Photo Mode: Save (Check) */}
            {isPhotoMode && onSave && (
                <button 
                    onClick={onSave}
                    className="w-10 h-full rounded-lg bg-green-500 border border-green-400 flex items-center justify-center text-white shadow-lg active:scale-95"
                >
                    <Icons.Check size={18} />
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default ToolsPanel;