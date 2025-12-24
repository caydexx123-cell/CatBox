import React, { useState, useEffect, useRef, useCallback } from 'react';
import CanvasEditor, { CanvasEditorHandle } from './components/CanvasEditor';
import Timeline from './components/Timeline';
import ToolsPanel from './components/ToolsPanel';
import AIAssistant from './components/AIAssistant';
import Gallery from './components/Gallery';
import SendHub from './components/SendHub';
import ColorPicker from './components/ColorPicker';
import SettingsModal from './components/SettingsModal';
import { Icons } from './components/Icon';
import { DrawingState, AnimationSettings, AppMode, GalleryItem, AppSettings } from './types';
import { exportToVideo } from './utils/exportUtils';
import { translations } from './utils/translations';

const App: React.FC = () => {
  // --- Global State ---
  const [mode, setMode] = useState<AppMode>('home');
  const canvasRef = useRef<CanvasEditorHandle>(null);
  
  // EASTER EGG STATE
  const [catClickCount, setCatClickCount] = useState(0);
  const [isAngryMode, setIsAngryMode] = useState(false);

  // New state for AI Overlay in Editor (Photo/Video) mode
  const [isAiOverlayOpen, setIsAiOverlayOpen] = useState(false);
  
  // Export State
  const [isExporting, setIsExporting] = useState(false);

  // Settings Persistence
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('catbox_settings');
      let settings = { language: 'ru', textStyle: 'default', optimizeFps: false, apiKey: '', aiModels: { photo: false, video: false }, enableSend: false } as AppSettings;
      
      if (saved) {
        const parsed = JSON.parse(saved);
        settings = { ...settings, ...parsed };
      }
      return settings;
    } catch (e) {
      return { language: 'ru', textStyle: 'default', optimizeFps: false, apiKey: '', aiModels: { photo: false, video: false }, enableSend: false };
    }
  });

  useEffect(() => {
    localStorage.setItem('catbox_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  // Gallery Persistence
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('catbox_gallery');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('catbox_gallery', JSON.stringify(gallery));
  }, [gallery]);

  // Frames Persistence
  const [frames, setFrames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('catbox_frames');
      return saved ? JSON.parse(saved) : [''];
    } catch { return ['']; }
  });

  useEffect(() => {
    localStorage.setItem('catbox_frames', JSON.stringify(frames));
  }, [frames]);

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [settings, setSettings] = useState<AnimationSettings>({
    fps: 12,
    onionSkin: true,
    isPlaying: false,
  });

  const [photoCanvasData, setPhotoCanvasData] = useState<string>('');

  const [drawingState, setDrawingState] = useState<DrawingState>({
    color: '#000000',
    brushSize: 8,
    tool: 'brush',
  });

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isUIHidden, setIsUIHidden] = useState(false);

  // --- Refs ---
  const playRef = useRef<number | null>(null);
  const lastPlayTime = useRef<number>(0);

  // --- Animation Logic ---
  const startPlayback = useCallback(() => {
    setSettings(prev => ({ ...prev, isPlaying: true }));
    setCurrentFrameIndex(0);
    let frame = 0;

    const loop = (timestamp: number) => {
      if (!lastPlayTime.current) lastPlayTime.current = timestamp;
      const elapsed = timestamp - lastPlayTime.current;

      if (elapsed > 1000 / settings.fps) {
        frame = (frame + 1) % frames.length;
        setCurrentFrameIndex(frame);
        lastPlayTime.current = timestamp;
      }
      playRef.current = requestAnimationFrame(loop);
    };

    playRef.current = requestAnimationFrame(loop);
  }, [frames.length, settings.fps]);

  const stopPlayback = useCallback(() => {
    setSettings(prev => ({ ...prev, isPlaying: false }));
    if (playRef.current) {
      cancelAnimationFrame(playRef.current);
      playRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (playRef.current) cancelAnimationFrame(playRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (settings.isPlaying) stopPlayback();
    else startPlayback();
  };

  // --- EASTER EGG LOGIC ---
  const handleCatClick = () => {
      if (isAngryMode) return;
      
      const newCount = catClickCount + 1;
      setCatClickCount(newCount);

      if (newCount >= 5) {
          setIsAngryMode(true);
          setCatClickCount(0);
          
          if ('vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 500]);

          setTimeout(() => {
              setIsAngryMode(false);
          }, 4000);
      }
  };

  // --- Action Handlers ---

  const handleUpdateFrame = (dataUrl: string) => {
    if (mode === 'animation') {
      const newFrames = [...frames];
      newFrames[currentFrameIndex] = dataUrl;
      setFrames(newFrames);
    } else if (mode === 'photo') {
      setPhotoCanvasData(dataUrl);
    }
  };

  const saveToGallery = (dataUrl: string, type: 'image' | 'ai-gen' | 'video-gen') => {
    if (!dataUrl) return;
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      type,
      dataUrl,
      timestamp: Date.now()
    };
    setGallery(prev => [newItem, ...prev]);
  };

  const handleAIImageGenerated = (url: string) => {
    saveToGallery(url, 'ai-gen');

    if (mode === 'animation') {
        const newFrames = [...frames];
        const lastFrame = newFrames[newFrames.length - 1];
        
        if (!lastFrame || lastFrame.length < 500) {
            newFrames[newFrames.length - 1] = url;
            setFrames(newFrames);
            setCurrentFrameIndex(newFrames.length - 1);
        } else {
            newFrames.push(url);
            setFrames(newFrames);
            setCurrentFrameIndex(newFrames.length - 1);
        }
    } else if (mode === 'photo') {
        handleUpdateFrame(url);
    }
  };

  const handleDeleteFrame = () => {
    stopPlayback(); 
    if(frames.length > 1) { 
        const nf = frames.filter((_, i) => i !== currentFrameIndex); 
        setFrames(nf); 
        setCurrentFrameIndex(Math.min(currentFrameIndex, nf.length - 1)); 
    } else {
        const nf = [''];
        setFrames(nf);
        canvasRef.current?.clear();
    }
  };

  // --- EXPORT LOGIC (Direct) ---

  const handleQuickExportVideo = async () => {
      stopPlayback();
      setIsExporting(true);
      
      // Delay to allow UI render
      await new Promise(r => setTimeout(r, 100));

      const videoUrl = await exportToVideo(frames, settings.fps);
      if (videoUrl) {
           const a = document.createElement('a');
           a.href = videoUrl;
           a.download = `catbox_anim_${Date.now()}.mp4`; 
           a.click();
      } else {
           alert("Ошибка экспорта");
      }
      setIsExporting(false);
  };

  const handleQuickSavePhoto = async () => {
     if (canvasRef.current && canvasRef.current.getSnapshot) {
         const snapshotUrl = await canvasRef.current.getSnapshot();
         const a = document.createElement('a');
         a.href = snapshotUrl;
         a.download = `catbox_art_${Date.now()}.png`; // Always PNG
         a.click();
         saveToGallery(snapshotUrl, 'image');
         // No alert needed, download starts automatically
     }
  };

  const openGallery = () => {
      stopPlayback();
      setMode('gallery');
  }

  const t = translations[appSettings.language];

  const showAiButton = 
    (mode === 'photo' && appSettings.aiModels.photo) || 
    (mode === 'animation' && appSettings.aiModels.video);

  const getFontClass = () => {
    if (appSettings.textStyle === 'minecraft') return 'font-minecraft';
    if (appSettings.textStyle === 'anime') return 'font-anime';
    return 'font-sans';
  };

  const safeAreaStyle = {
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  };

  const bgStyle = isAngryMode 
     ? "bg-red-950 transition-colors duration-100" 
     : "bg-[#0f172a] transition-colors duration-500";
  
  const borderStyle = isAngryMode ? "border-red-500/50" : "border-white/10";

  return (
    <div 
      className={`fixed inset-0 w-full h-[100dvh] text-white overflow-hidden selection:bg-none select-none flex justify-center items-center ${getFontClass()} ${bgStyle} ${isAngryMode ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''}`}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, -2px); }
          75% { transform: translate(-2px, -2px); }
        }
      `}</style>

      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{ 
            backgroundImage: isAngryMode 
                ? 'repeating-linear-gradient(45deg, #450a0a 0, #450a0a 10px, #7f1d1d 10px, #7f1d1d 20px)' 
                : 'radial-gradient(#4b5563 1px, transparent 1px)', 
            backgroundSize: isAngryMode ? '100% 100%' : '32px 32px' 
        }}>
      </div>
      
      {/* Fancy Glow */}
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br z-0 pointer-events-none ${isAngryMode ? 'from-red-900/50 to-black' : 'from-indigo-900/20 via-transparent to-black/40'}`}></div>

      {/* Main App Container */}
      <div 
        className={`relative w-full h-full max-w-6xl flex flex-col shadow-2xl md:border-x-2 ${borderStyle} bg-catbox-dark/80 backdrop-blur-2xl z-10 transition-all`}
        style={safeAreaStyle}
      >
        
        {/* --- MAIN NAVIGATION HEADER --- */}
        {mode !== 'home' && (
           <div className={`flex items-center justify-between p-2 px-4 md:p-4 z-40 bg-gradient-to-b from-black/80 to-transparent transition-all duration-300 ${isUIHidden ? '-translate-y-full' : ''} flex-shrink-0`}>
             <div className="flex items-center gap-3">
                <button 
                onClick={() => {
                    stopPlayback();
                    setMode('home');
                    setIsAiOverlayOpen(false);
                }} 
                className="p-2 -ml-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors active:scale-95"
                >
                <Icons.Home size={24} />
                </button>

                {mode === 'animation' && <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-catbox-accent border border-catbox-accent/30 px-2 py-1 rounded hidden md:inline-block bg-catbox-accent/10">{t.animation}</span>}
                {mode === 'photo' && <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-catbox-secondary border border-catbox-secondary/30 px-2 py-1 rounded hidden md:inline-block bg-catbox-secondary/10">{t.photo}</span>}
             </div>

             <div className="flex items-center gap-2">
                {(mode === 'animation' || mode === 'photo') && (
                    <>
                      {showAiButton && (
                        <button 
                            onClick={() => setIsAiOverlayOpen(true)} 
                            className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full hover:bg-blue-500/30 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)] active:scale-95" 
                        >
                            <Icons.Sparkles size={22} />
                        </button>
                      )}

                      <button onClick={openGallery} className="p-2 bg-white/5 border border-white/20 rounded-full hover:bg-white/10 text-yellow-400 active:scale-95">
                          <Icons.Folder size={22} />
                      </button>
                    </>
                )}

                {mode === 'animation' && (
                    <>
                    <div className="relative z-50 flex items-center gap-2 bg-black/60 p-1 px-3 rounded-full backdrop-blur-md border border-white/20 shadow-inner">
                        <div className="flex flex-col items-center justify-center pr-1 w-14 md:w-20 pt-1">
                             <input 
                                type="range" 
                                min="1" 
                                max="60" 
                                value={settings.fps} 
                                onChange={(e) => setSettings(s => ({...s, fps: Number(e.target.value)}))}
                                className="w-full h-1 opacity-90 hover:opacity-100 cursor-pointer mb-2 accent-catbox-accent"
                             />
                             <span className="text-[9px] font-bold text-catbox-accent leading-none mt-1 block">{settings.fps} FPS</span>
                        </div>
                        <button onClick={togglePlay} className={`p-1.5 rounded-full transition-all border border-white/10 ${settings.isPlaying ? 'bg-catbox-secondary animate-pulse' : 'bg-white text-black'}`}>
                            {settings.isPlaying ? <Icons.Pause size={14} fill="currentColor"/> : <Icons.Play size={14} fill="currentColor"/>}
                        </button>
                    </div>
                    {/* EXPORT VIDEO BUTTON - DIRECT */}
                    <button onClick={handleQuickExportVideo} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-catbox-accent border border-white/10 active:scale-95">
                        <Icons.Download size={22} />
                    </button>
                    </>
                )}
             </div>
           </div>
        )}

        {/* --- SCREENS --- */}

        {/* 1. HOME HUB */}
        {mode === 'home' && (
          <div className="flex-1 w-full flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in relative z-20 overflow-y-auto custom-scrollbar">
             
             <button 
                onClick={() => setMode('settings')} 
                className="absolute top-4 right-4 md:top-6 md:right-6 p-3 bg-white/5 rounded-full hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all text-gray-400 hover:text-white backdrop-blur-md"
             >
                <Icons.Settings size={24} />
             </button>

             <div className="text-center space-y-2 mt-4">
                <div className="relative inline-block group cursor-pointer" onClick={handleCatClick}>
                    <div className={`absolute inset-0 blur-3xl rounded-full transition-opacity duration-300 ${isAngryMode ? 'bg-red-600 opacity-60 animate-pulse' : 'bg-catbox-accent opacity-30 group-hover:opacity-50'}`}></div>
                    <div className={`relative w-32 h-32 backdrop-blur-xl rounded-full border-2 flex items-center justify-center shadow-2xl mx-auto mb-6 transition-transform duration-100 ${isAngryMode ? 'border-red-500 bg-black/50 scale-125' : 'border-white/20 bg-white/10 group-hover:scale-110'}`}>
                        {/* CAT ICON - Passes angry state */}
                        <Icons.Cat size={80} className={`drop-shadow-2xl transition-all ${isAngryMode ? 'text-red-500' : 'text-white'}`} isAngry={isAngryMode} />
                    </div>
                </div>
                <h1 className={`text-5xl md:text-6xl font-black bg-clip-text text-transparent tracking-tighter ${isAngryMode ? 'bg-red-500' : 'bg-gradient-to-r from-catbox-accent via-white to-catbox-secondary'}`}>
                    {isAngryMode ? "ANGRY CAT!" : "CatBox"}
                </h1>
                <p className="text-gray-400 tracking-[0.3em] uppercase text-[10px] font-bold border-t border-b border-white/10 py-2 inline-block px-4">{t.app_title}</p>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-xl pb-20">
                <button 
                  onClick={() => setMode('animation')}
                  className={`aspect-[4/3] bg-catbox-panel/60 border-2 rounded-3xl flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-all group backdrop-blur-xl shadow-xl active:scale-95 ${isAngryMode ? 'border-red-500/30' : 'border-white/10 hover:border-catbox-accent'}`}
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors border ${isAngryMode ? 'bg-red-900/50 text-red-400 border-red-500' : 'bg-catbox-accent/20 group-hover:bg-catbox-accent group-hover:text-white text-catbox-accent border-white/10'}`}>
                    <Icons.Film size={26} />
                  </div>
                  <span className="font-bold text-xs md:text-sm tracking-wide">{t.animation}</span>
                </button>

                <button 
                  onClick={() => setMode('photo')}
                  className={`aspect-[4/3] bg-catbox-panel/60 border-2 rounded-3xl flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-all group backdrop-blur-xl shadow-xl active:scale-95 ${isAngryMode ? 'border-red-500/30' : 'border-white/10 hover:border-catbox-secondary'}`}
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors border ${isAngryMode ? 'bg-red-900/50 text-red-400 border-red-500' : 'bg-catbox-secondary/20 group-hover:bg-catbox-secondary group-hover:text-white text-catbox-secondary border-white/10'}`}>
                    <Icons.Image size={26} />
                  </div>
                  <span className="font-bold text-xs md:text-sm tracking-wide">{t.photo}</span>
                </button>

                 <button 
                  onClick={() => setMode('gallery')}
                  className={`aspect-[4/3] bg-catbox-surface/40 border-2 rounded-3xl flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition-all group backdrop-blur-xl shadow-xl active:scale-95 ${isAngryMode ? 'border-red-500/30' : 'border-white/5 hover:border-yellow-400/50'}`}
                >
                   <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors border ${isAngryMode ? 'bg-red-900/50 text-red-400 border-red-500' : 'bg-yellow-400/10 group-hover:bg-yellow-400 group-hover:text-black text-yellow-400 border-white/10'}`}>
                       <Icons.Folder size={22} />
                   </div>
                   <span className="font-bold text-xs md:text-sm tracking-wide">{t.folder}</span>
                </button>

                <button 
                  onClick={() => setMode('ai-chat')}
                  className={`md:col-span-1 p-5 border-2 rounded-3xl flex flex-col items-center justify-center gap-2 hover:scale-[1.01] transition-all group backdrop-blur-xl shadow-xl active:scale-95 ${isAngryMode ? 'bg-red-900/20 border-red-500/30' : 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-white/10 hover:border-blue-500/50'}`}
                >
                   <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors border ${isAngryMode ? 'bg-red-900/50 text-red-400 border-red-500' : 'bg-blue-500/20 group-hover:bg-blue-500 group-hover:text-white text-blue-400 border-white/10'}`}>
                       <Icons.Sparkles size={26} />
                   </div>
                   <div className="text-center">
                      <div className="font-bold text-blue-100 text-xs md:text-sm">{t.ai_chat}</div>
                   </div>
                </button>

                {appSettings.enableSend && (
                <button 
                  onClick={() => setMode('send')}
                  className={`col-span-2 md:col-span-2 p-4 border-2 rounded-3xl flex items-center justify-center gap-3 transition-all group active:scale-95 ${isAngryMode ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-green-900/20 border-green-500/20 hover:bg-green-500/20 hover:border-green-500 text-green-400'}`}
                >
                   <Icons.Send size={20} className="group-hover:translate-x-1 transition-transform" />
                   <span className="font-bold uppercase tracking-widest text-xs md:text-sm">{t.multiplayer}</span>
                </button>
                )}
             </div>
          </div>
        )}

        {/* 2. ANIMATION MODE */}
        {mode === 'animation' && (
          <>
            <div className="flex-1 w-full min-h-0 relative flex flex-col items-center justify-center overflow-hidden z-10">
               <CanvasEditor 
                 ref={canvasRef}
                 key={`anim-canvas-${currentFrameIndex}-${appSettings.optimizeFps}`} 
                 currentFrameData={frames[currentFrameIndex]}
                 previousFrameData={currentFrameIndex > 0 ? frames[currentFrameIndex - 1] : null}
                 onionSkinEnabled={settings.onionSkin && !settings.isPlaying}
                 drawingState={drawingState}
                 onUpdateFrame={handleUpdateFrame}
                 isInteracting={setIsUIHidden}
                 isPlaying={settings.isPlaying}
                 optimizeFps={appSettings.optimizeFps}
               />
            </div>
            
            <div className={`flex flex-col w-full z-30 flex-shrink-0 transition-transform duration-300 ${isUIHidden ? 'translate-y-[120%]' : ''}`}>
              <Timeline 
                frames={frames}
                currentFrameIndex={currentFrameIndex}
                onSelectFrame={(i) => { stopPlayback(); setCurrentFrameIndex(i); }}
                onAddFrame={() => { stopPlayback(); const nf = [...frames]; nf.splice(currentFrameIndex + 1, 0, ''); setFrames(nf); setCurrentFrameIndex(currentFrameIndex + 1); }}
                onDuplicateFrame={() => { stopPlayback(); const nf = [...frames]; nf.splice(currentFrameIndex + 1, 0, frames[currentFrameIndex]); setFrames(nf); setCurrentFrameIndex(currentFrameIndex + 1); }}
                onDeleteFrame={handleDeleteFrame}
                lang={appSettings.language}
              />
              <ToolsPanel 
                drawingState={drawingState} 
                setDrawingState={setDrawingState}
                onUndo={() => canvasRef.current?.undo()}
                onRedo={() => canvasRef.current?.redo()}
                onClear={() => canvasRef.current?.clear()}
                onOpenColorPicker={() => setShowColorPicker(true)}
                lang={appSettings.language}
              />
            </div>
          </>
        )}

        {/* 3. PHOTO MODE */}
        {mode === 'photo' && (
           <>
             <div className="flex-1 w-full min-h-0 relative flex flex-col items-center justify-center overflow-hidden z-10">
               <CanvasEditor 
                 ref={canvasRef}
                 key={`photo-canvas-${appSettings.optimizeFps}`} 
                 currentFrameData={photoCanvasData}
                 previousFrameData={null}
                 onionSkinEnabled={false}
                 drawingState={drawingState}
                 onUpdateFrame={handleUpdateFrame}
                 isInteracting={setIsUIHidden}
                 isPlaying={false}
                 optimizeFps={appSettings.optimizeFps}
               />
             </div>
             <div className={`w-full z-30 flex-shrink-0 transition-transform duration-300 ${isUIHidden ? 'translate-y-[120%]' : ''}`}>
                <ToolsPanel 
                  drawingState={drawingState}
                  setDrawingState={setDrawingState}
                  onUndo={() => canvasRef.current?.undo()}
                  onRedo={() => canvasRef.current?.redo()}
                  onClear={() => canvasRef.current?.clear()}
                  isPhotoMode={true}
                  onSave={handleQuickSavePhoto} // DIRECT SAVE
                  onOpenColorPicker={() => setShowColorPicker(true)}
                  lang={appSettings.language}
                />
             </div>
           </>
        )}

        {/* 4. OVERLAYS */}
        {showColorPicker && (
            <ColorPicker 
               currentColor={drawingState.color}
               onClose={() => setShowColorPicker(false)}
               onColorSelect={(color) => setDrawingState(s => ({ ...s, color }))}
            />
        )}

        {mode === 'ai-chat' && (
           <AIAssistant 
              settings={appSettings}
              onClose={() => setMode('home')}
              onImageGenerated={(url) => handleAIImageGenerated(url)}
              onVideoGenerated={(url) => saveToGallery(url, 'video-gen')}
              variant="home"
              onUpdateSettings={setAppSettings}
           />
        )}

        {isAiOverlayOpen && (mode === 'animation' || mode === 'photo') && (
           <AIAssistant 
              settings={appSettings}
              onClose={() => setIsAiOverlayOpen(false)}
              onImageGenerated={(url) => handleAIImageGenerated(url)}
              onVideoGenerated={(url) => saveToGallery(url, 'video-gen')}
              variant="editor"
              onUpdateSettings={setAppSettings}
           />
        )}

        {mode === 'settings' && (
            <SettingsModal 
               settings={appSettings}
               onUpdateSettings={setAppSettings}
               onClose={() => setMode('home')}
            />
        )}

        {mode === 'gallery' && (
           <Gallery 
             items={gallery}
             onClose={() => setMode('home')}
             onSendToAnimation={(url) => {
                const newFrames = [...frames];
                if (newFrames.length === 1 && !newFrames[0]) {
                    newFrames[0] = url;
                    setCurrentFrameIndex(0);
                } else {
                    newFrames.push(url);
                    setCurrentFrameIndex(newFrames.length - 1);
                }
                setFrames(newFrames);
                setTimeout(() => setMode('animation'), 0);
             }}
             onEditPhoto={(url) => {
                setPhotoCanvasData(url);
                setTimeout(() => setMode('photo'), 0);
             }}
             lang={appSettings.language}
           />
        )}

        {mode === 'send' && (
            <SendHub 
                onClose={() => setMode('home')}
                galleryItems={gallery}
                lang={appSettings.language}
            />
        )}

        {/* SPINNER ONLY */}
        {isExporting && (
            <div className="absolute inset-0 z-[110] bg-black/80 flex flex-col items-center justify-center animate-fade-in">
                <div className="loader mb-4"></div>
                <div className="text-white font-bold animate-pulse">Rendering...</div>
            </div>
        )}

      </div>
    </div>
  );
};

export default App;