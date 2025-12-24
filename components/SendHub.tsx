import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';
import { GalleryItem, Language } from '../types';
import { translations } from '../utils/translations';

interface SendHubProps {
  onClose: () => void;
  galleryItems: GalleryItem[];
  lang: Language;
}

interface ChatMessage {
    id: string;
    type: 'sent' | 'received';
    user: string;
    item: GalleryItem;
    timestamp: number;
}

const SendHub: React.FC<SendHubProps> = ({ onClose, galleryItems, lang }) => {
  const t = translations[lang];
  const [username, setUsername] = useState(localStorage.getItem('catbox_username') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('catbox_username'));
  const [selectedFile, setSelectedFile] = useState<GalleryItem | null>(null);
  const [targetId, setTargetId] = useState('');
  
  // Unified History
  const [history, setHistory] = useState<ChatMessage[]>([]);
  
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  useEffect(() => {
    const bc = new BroadcastChannel('catbox_net');
    setChannel(bc);

    bc.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'file_transfer' && payload.to === username) {
           const msg: ChatMessage = {
               id: Date.now().toString() + Math.random(),
               type: 'received',
               user: payload.from,
               item: payload.item,
               timestamp: Date.now()
           };
           setHistory(prev => [msg, ...prev]);
           if ('vibrate' in navigator) navigator.vibrate(200);
      }
    };

    return () => bc.close();
  }, [username]);

  const handleLogin = () => {
    if (!username.trim()) return;
    localStorage.setItem('catbox_username', username);
    setIsLoggedIn(true);
  };

  const handleSend = () => {
    if (!selectedFile || !targetId.trim()) return;
    
    // Broadcast
    channel?.postMessage({ 
        type: 'file_transfer', 
        payload: { from: username, to: targetId.trim(), item: selectedFile } 
    });

    // Add to local history as sent
    const msg: ChatMessage = {
        id: Date.now().toString() + Math.random(),
        type: 'sent',
        user: targetId.trim(),
        item: selectedFile,
        timestamp: Date.now()
    };
    setHistory(prev => [msg, ...prev]);

    setSelectedFile(null);
  };

  const handleDownload = (dataUrl: string, type: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `catbox_received_${Date.now()}.${type === 'video-gen' ? 'mp4' : 'png'}`;
    a.click();
  };

  if (!isLoggedIn) {
    return (
      <div className="absolute inset-0 z-50 bg-catbox-dark flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-md bg-catbox-panel border border-white/10 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
           <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400 border border-white/10">
              <Icons.Wifi size={40} />
           </div>
           <div>
             <h2 className="text-2xl font-black text-white">CatBox ID</h2>
           </div>
           <input 
             type="text" 
             value={username} 
             onChange={(e) => setUsername(e.target.value)}
             placeholder="ID..."
             className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-center text-white text-lg font-bold focus:border-green-500 focus:outline-none"
           />
           <button 
             onClick={handleLogin}
             className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
           >
             OK
           </button>
           <button onClick={onClose} className="text-gray-500 text-sm hover:text-white">X</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-catbox-dark flex flex-col animate-fade-in">
      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-catbox-panel/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full absolute -top-1 -right-1 border-2 border-catbox-panel animate-pulse"></div>
                <Icons.Wifi size={24} className="text-green-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white leading-none">{t.send_title}</h2>
                <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">{t.your_id}: <span className="text-white select-all">{username}</span></p>
            </div>
        </div>
        
        <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 text-xs font-bold uppercase tracking-wider">
           {t.back}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
         {/* GALLERY SELECTOR (Left/Top) */}
         <div className="flex-1 p-4 overflow-y-auto border-r border-white/10 bg-black/10">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Icons.Image size={14} /> {t.folder}
            </h3>
            {galleryItems.length === 0 ? (
                <div className="text-gray-500 text-center py-10">{t.empty_folder}</div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {galleryItems.map(item => (
                        <div 
                           key={item.id}
                           onClick={() => setSelectedFile(item)}
                           className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${selectedFile?.id === item.id ? 'border-green-500 scale-105 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-white/10 hover:border-white/30'}`}
                        >
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMzMzMiLz48cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjNDQ0Ii8+PHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzQ0NCIvPjwvc3ZnPg==')] opacity-30 z-0"></div>
                            <img src={item.dataUrl} className="w-full h-full object-cover relative z-10" />
                        </div>
                    ))}
                </div>
            )}
         </div>

         {/* CHAT / SEND AREA (Right/Bottom) */}
         <div className="flex-[1.5] p-4 flex flex-col bg-catbox-panel/30">
            
            {/* Input Zone */}
            <div className="bg-catbox-panel p-4 rounded-2xl border border-white/10 mb-4 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-black/30 rounded-xl border border-white/20 px-3 flex-1">
                        <Icons.User size={18} className="text-gray-400" />
                        <input 
                            type="text" 
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                            placeholder={t.send_id_label}
                            className="flex-1 bg-transparent border-none p-3 text-white focus:outline-none placeholder-gray-500"
                        />
                    </div>
                    
                    <button 
                    onClick={handleSend}
                    disabled={!selectedFile || !targetId.trim()}
                    className={`h-full px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedFile && targetId ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg' : 'bg-white/5 text-gray-500'}`}
                    >
                        <Icons.Send size={20} />
                    </button>
                </div>
                {selectedFile && (
                    <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                        <Icons.Check size={10} /> Selected: File_{selectedFile.id.slice(-4)}
                    </div>
                )}
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar flex flex-col-reverse">
                {history.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2 opacity-50">
                        <Icons.Users size={40} />
                        <p className="text-sm">No history yet</p>
                    </div>
                )}
                
                {history.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3 border ${msg.type === 'sent' ? 'bg-green-900/40 border-green-500/30 rounded-br-none' : 'bg-white/10 border-white/10 rounded-bl-none'}`}>
                            <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                                <span className={`text-xs font-bold uppercase ${msg.type === 'sent' ? 'text-green-400' : 'text-blue-400'}`}>
                                    {msg.type === 'sent' ? `${t.sent} -> ${msg.user}` : msg.user}
                                </span>
                                <span className="text-[10px] text-gray-500 ml-auto">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            
                            <div className="relative group">
                                <img src={msg.item.dataUrl} className="rounded-lg max-h-40 w-auto object-cover border border-white/10" />
                                <button 
                                    onClick={() => handleDownload(msg.item.dataUrl, msg.item.type)}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
                                >
                                    <Icons.Download className="text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default SendHub;