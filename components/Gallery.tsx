import React, { useState } from 'react';
import { Icons } from './Icon';
import { GalleryItem, Language } from '../types';
import { translations } from '../utils/translations';

interface GalleryProps {
  items: GalleryItem[];
  onClose: () => void;
  onSendToAnimation: (dataUrl: string) => void;
  onEditPhoto: (dataUrl: string) => void;
  lang: Language;
}

const Gallery: React.FC<GalleryProps> = ({ items, onClose, onSendToAnimation, onEditPhoto, lang }) => {
  const t = translations[lang];
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const handleDownloadClick = (item: GalleryItem) => {
      const a = document.createElement('a');
      a.href = item.dataUrl;
      
      if (item.type === 'video-gen') {
          a.download = `catbox_${item.id}.mp4`; // Always name it mp4 for user
      } else {
          a.download = `catbox_${item.id}.png`; // Always png
      }
      
      a.click();
  };

  return (
    <div className="absolute inset-0 z-50 bg-catbox-dark flex flex-col animate-fade-in">
      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-catbox-panel/50 backdrop-blur-md">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <Icons.Folder size={20} className="text-yellow-400" />
          {t.folder}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Icons.X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
             <Icons.Folder size={64} className="opacity-20" />
             <p>{t.empty_folder}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer hover:border-catbox-accent transition-colors"
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMzMzMiLz48cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjNDQ0Ii8+PHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzQ0NCIvPjwvc3ZnPg==')] opacity-50 z-0"></div>

                {item.type === 'video-gen' ? (
                     <video src={item.dataUrl} className="w-full h-full object-cover relative z-10" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
                ) : (
                    <img src={item.dataUrl} alt="Gallery Item" className="w-full h-full object-cover relative z-10" />
                )}
                
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-full z-20">
                    {item.type === 'ai-gen' && <Icons.Sparkles size={12} className="text-blue-400" />}
                    {item.type === 'video-gen' && <Icons.Film size={12} className="text-red-400" />}
                    {item.type === 'image' && <Icons.Pencil size={12} className="text-gray-200" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-lg flex items-center justify-center p-6">
           <div className="bg-catbox-panel w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col gap-6 relative">
              <button 
                onClick={() => setSelectedItem(null)} 
                className="absolute -top-12 right-0 bg-white/10 text-white p-2 rounded-full backdrop-blur-md hover:bg-white/20"
              >
                <Icons.X size={24} />
              </button>

              <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-white/10">
                 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMzMzMiLz48cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjNDQ0Ii8+PHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzQ0NCIvPjwvc3ZnPg==')] opacity-50 z-0"></div>
                 {selectedItem.type === 'video-gen' ? (
                     <video src={selectedItem.dataUrl} className="w-full h-full object-contain relative z-10" controls autoPlay loop />
                 ) : (
                     <img src={selectedItem.dataUrl} className="w-full h-full object-contain relative z-10" />
                 )}
              </div>

              <div className="space-y-3">
                  <div className="flex gap-2 mb-4">
                      <button 
                        onClick={() => handleDownloadClick(selectedItem)}
                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2"
                      >
                          <Icons.Download size={16} /> {t.download}
                      </button>
                  </div>

                  {selectedItem.type !== 'video-gen' && (
                  <>
                    <button 
                        onClick={() => {
                            onSendToAnimation(selectedItem.dataUrl);
                            setSelectedItem(null);
                            onClose(); 
                        }}
                        className="w-full p-4 rounded-xl bg-catbox-surface hover:bg-white/10 border border-white/5 flex items-center justify-between group transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-catbox-accent p-2 rounded-lg text-white">
                                <Icons.Film size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm">{t.to_anim}</div>
                            </div>
                        </div>
                        <Icons.ArrowRight size={16} className="text-gray-500 group-hover:text-white" />
                    </button>

                    <button 
                        onClick={() => {
                            onEditPhoto(selectedItem.dataUrl);
                            setSelectedItem(null);
                            onClose();
                        }}
                        className="w-full p-4 rounded-xl bg-catbox-surface hover:bg-white/10 border border-white/5 flex items-center justify-between group transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-catbox-secondary p-2 rounded-lg text-white">
                                <Icons.Image size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm">{t.to_photo}</div>
                            </div>
                        </div>
                        <Icons.ArrowRight size={16} className="text-gray-500 group-hover:text-white" />
                    </button>
                  </>
                  )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;