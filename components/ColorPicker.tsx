import React from 'react';
import { Icons } from './Icon';

interface ColorPickerProps {
  currentColor: string;
  onColorSelect: (color: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#000000', '#ffffff', '#94a3b8', '#475569',
  '#ef4444', '#dc2626', '#991b1b', // Reds
  '#f97316', '#ea580c', '#c2410c', // Oranges
  '#facc15', '#eab308', '#ca8a04', // Yellows
  '#4ade80', '#22c55e', '#16a34a', // Greens
  '#2dd4bf', '#14b8a6', '#0f766e', // Teals
  '#60a5fa', '#3b82f6', '#2563eb', // Blues
  '#818cf8', '#6366f1', '#4f46e5', // Indigos
  '#c084fc', '#a855f7', '#7e22ce', // Purples
  '#f472b6', '#ec4899', '#db2777', // Pinks
  '#78350f', '#451a03'             // Browns
];

const ColorPicker: React.FC<ColorPickerProps> = ({ currentColor, onColorSelect, onClose }) => {
  return (
    <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center animate-fade-in">
      <div className="w-full md:max-w-md bg-catbox-panel border-t md:border border-white/10 md:rounded-3xl p-6 shadow-2xl pb-10 md:pb-6">
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Выбор цвета</h3>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
            <Icons.X size={20} />
          </button>
        </div>

        {/* Custom Input Area */}
        <div className="flex items-center gap-4 mb-6">
           <div 
             className="w-20 h-20 rounded-2xl border-2 border-white/20 shadow-inner"
             style={{ backgroundColor: currentColor }}
           ></div>
           <div className="flex-1 space-y-2">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Кастомный</label>
              <div className="h-12 rounded-xl overflow-hidden relative border border-white/20">
                <input 
                  type="color" 
                  value={currentColor}
                  onChange={(e) => onColorSelect(e.target.value)}
                  className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] cursor-pointer"
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-black/50 font-bold mix-blend-difference">
                   <Icons.Plus size={24} />
                </div>
              </div>
           </div>
        </div>

        {/* Grid */}
        <div className="space-y-2">
           <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Палитра</label>
           <div className="grid grid-cols-7 gap-3">
             {PRESET_COLORS.map((c) => (
               <button
                 key={c}
                 onClick={() => { onColorSelect(c); onClose(); }}
                 className={`aspect-square rounded-full border-2 transition-transform hover:scale-110 ${currentColor === c ? 'border-white scale-110' : 'border-white/10'}`}
                 style={{ backgroundColor: c }}
               />
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ColorPicker;