import React, { useRef, useEffect, useState } from 'react';
import { Icons } from './Icon';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface TimelineProps {
  frames: string[];
  currentFrameIndex: number;
  onSelectFrame: (index: number) => void;
  onAddFrame: () => void;
  onDuplicateFrame: () => void;
  onDeleteFrame: () => void;
  lang: Language;
}

const Timeline: React.FC<TimelineProps> = ({
  frames,
  currentFrameIndex,
  onSelectFrame,
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  lang
}) => {
  const t = translations[lang];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto scroll to active frame
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.children[currentFrameIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentFrameIndex, frames.length]);

  const handleDelete = () => {
    setIsDeleting(true);
    onDeleteFrame();
    setTimeout(() => setIsDeleting(false), 300); // Visual feedback duration
  };

  return (
    <div className="w-full bg-catbox-panel/80 backdrop-blur-xl border-t border-white/10 py-4 pb-6 md:pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-40">
      <div className="flex items-center gap-3 px-4 overflow-x-auto hide-scrollbar touch-pan-x" ref={scrollRef}>
        
        {frames.map((frame, index) => (
          <div
            key={index}
            onClick={() => onSelectFrame(index)}
            className={`relative flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 overflow-hidden transition-all duration-300 cursor-pointer group ${
              index === currentFrameIndex 
                ? 'border-catbox-accent shadow-[0_0_20px_rgba(139,92,246,0.6)] scale-110 z-10 ring-2 ring-catbox-accent/30' 
                : 'border-white/10 opacity-60 hover:opacity-100 hover:scale-105 hover:border-white/30'
            }`}
          >
            <div className={`absolute top-0 left-0 px-1.5 py-0.5 rounded-br-lg text-[9px] font-bold z-20 backdrop-blur-md ${
                index === currentFrameIndex ? 'bg-catbox-accent text-white' : 'bg-black/40 text-white/70'
            }`}>
              {index + 1}
            </div>
            {frame ? (
              <img src={frame} alt={`Frame ${index + 1}`} className="w-full h-full object-cover bg-white" />
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center">
                  <div className="w-full h-full opacity-5 bg-[radial-gradient(circle,_#000_1px,_transparent_1px)] bg-[size:4px_4px]"></div>
              </div>
            )}
          </div>
        ))}

        <div className="w-px h-10 bg-white/10 mx-1"></div>

        <div className="flex items-center gap-2">
            <button
            onClick={onAddFrame}
            className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/40 hover:text-catbox-secondary hover:border-catbox-secondary/50 hover:bg-catbox-secondary/10 transition-all active:scale-95 group"
            title="Add Blank Frame"
            >
            <Icons.Plus size={20} className="mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-medium uppercase tracking-wider">{t.new_frame}</span>
            </button>

            <button
            onClick={onDuplicateFrame}
            className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl bg-catbox-accent/10 border border-catbox-accent/30 flex flex-col items-center justify-center text-catbox-accent hover:bg-catbox-accent/20 hover:border-catbox-accent transition-all active:scale-95 group"
            title="Duplicate Current Frame"
            >
            <Icons.Copy size={18} className="mb-1 group-hover:rotate-12 transition-transform" />
            <span className="text-[8px] font-medium uppercase tracking-wider">{t.copy_frame}</span>
            </button>
        </div>

         <button
         onClick={(e) => {
             e.stopPropagation();
             handleDelete();
         }}
         className={`flex-shrink-0 w-10 h-10 ml-2 rounded-full border-2 flex items-center justify-center transition-all shadow-lg active:scale-95 duration-200 ${
             frames.length === 1 
             ? 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed opacity-50' 
             : isDeleting 
                 ? 'bg-red-600 border-red-500 text-white scale-110 shadow-[0_0_20px_rgba(220,38,38,0.8)]' 
                 : 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500 hover:text-white'
         }`}
         title="Delete Frame"
       >
         <Icons.Trash size={18} />
       </button>
      </div>
    </div>
  );
};

export default Timeline;