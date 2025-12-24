import React from 'react';
import { Icons } from './Icon';

interface ExportModalProps {
  type: 'video' | 'photo';
  onConfirm: (format: string) => void;
  onCancel: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ type, onConfirm, onCancel }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm bg-catbox-panel border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-catbox-accent/20 flex items-center justify-center mx-auto border border-white/10">
            <Icons.Download size={32} className="text-catbox-accent" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {type === 'video' ? 'Экспорт Видео' : 'Сохранить Фото'}
          </h3>
          <p className="text-gray-400 text-sm">Выберите формат файла</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {type === 'video' ? (
            <>
              <button 
                onClick={() => onConfirm('mp4')}
                className="p-4 bg-white/5 hover:bg-catbox-accent hover:text-white border border-white/10 hover:border-catbox-accent rounded-xl flex flex-col items-center gap-2 transition-all group"
              >
                <span className="font-black text-lg">MP4</span>
                <span className="text-[10px] uppercase opacity-60">Совместимый</span>
              </button>
              <button 
                onClick={() => onConfirm('webm')}
                className="p-4 bg-white/5 hover:bg-catbox-secondary hover:text-white border border-white/10 hover:border-catbox-secondary rounded-xl flex flex-col items-center gap-2 transition-all group"
              >
                <span className="font-black text-lg">WebM</span>
                <span className="text-[10px] uppercase opacity-60">Web Стандарт</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onConfirm('png')}
                className="p-4 bg-white/5 hover:bg-blue-500 hover:text-white border border-white/10 hover:border-blue-500 rounded-xl flex flex-col items-center gap-2 transition-all group"
              >
                <span className="font-black text-lg">PNG</span>
                <span className="text-[10px] uppercase opacity-60">Лучшее качество</span>
              </button>
              <button 
                onClick={() => onConfirm('jpeg')}
                className="p-4 bg-white/5 hover:bg-orange-500 hover:text-white border border-white/10 hover:border-orange-500 rounded-xl flex flex-col items-center gap-2 transition-all group"
              >
                <span className="font-black text-lg">JPG</span>
                <span className="text-[10px] uppercase opacity-60">Меньший вес</span>
              </button>
            </>
          )}
        </div>

        <button 
          onClick={onCancel}
          className="w-full py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-bold uppercase"
        >
          Отмена
        </button>

      </div>
    </div>
  );
};

export default ExportModal;