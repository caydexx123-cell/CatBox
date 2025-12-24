import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icon';
import { GoogleGenAI } from "@google/genai";
import { AppSettings } from '../types';
import { translations } from '../utils/translations';

interface AIAssistantProps {
  onImageGenerated: (dataUrl: string) => void;
  onVideoGenerated: (videoUrl: string) => void;
  onClose: () => void;
  settings: AppSettings;
  variant?: 'home' | 'editor'; // New prop to distinguish visual style
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  type: 'text' | 'image';
  content: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onImageGenerated, onVideoGenerated, onClose, settings, variant = 'home' }) => {
  const t = translations[settings.language];
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'ai', type: 'text', content: t.chat_welcome }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine active mode based on settings
  const [activeMode, setActiveMode] = useState<'photo' | 'video'>(
      settings.aiModels.photo ? 'photo' : (settings.aiModels.video ? 'video' : 'photo')
  );
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', type: 'text', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
       const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
       
       // Both modes use Gemini 2.5 Flash Image.
       const finalPrompt = activeMode === 'video' 
          ? `${inputValue}, cinematic shot, wide 16:9 aspect ratio, high quality` 
          : `${inputValue}, square 1:1 aspect ratio`;

       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] },
       });
        
       let found = false;
       if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', type: 'image', content: url }]);
                
                // Save to gallery
                onImageGenerated(url);
                found = true;
                break;
            }
            }
       }
       if (!found) throw new Error("No image generated");

    } catch (e: any) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', type: 'text', content: 'Error: ' + e.message }]);
    } finally {
        setIsLoading(false);
    }
  };

  // Styles based on variant
  const headerGradient = variant === 'home' 
    ? 'bg-gradient-to-r from-blue-400 to-cyan-400' 
    : 'bg-gradient-to-r from-catbox-accent to-pink-500';

  const titleText = variant === 'home' ? t.ai_studio : t.ai_helper;

  return (
    <div className={`absolute inset-0 z-50 bg-catbox-dark flex flex-col animate-fade-in ${variant === 'editor' ? 'bg-black/90 backdrop-blur-xl' : ''}`}>
       {/* Header */}
       <div className={`p-4 flex items-center justify-between border-b border-white/10 ${variant === 'editor' ? 'bg-transparent' : 'bg-catbox-panel/80'} backdrop-blur-md`}>
        <h2 className={`text-xl font-bold flex items-center gap-2 text-transparent bg-clip-text ${headerGradient}`}>
          <Icons.Sparkles size={20} className={variant === 'home' ? 'text-blue-400' : 'text-catbox-accent'} />
          {titleText}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/10">
          <Icons.X size={24} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
          {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                  {/* AI Icon Avatar */}
                  {msg.role === 'ai' && (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white/20 shadow-xl mt-1 ${
                          variant === 'home' 
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-600' 
                          : 'bg-gradient-to-br from-purple-600 to-pink-600'
                      }`}>
                          <Icons.Sparkles size={20} className="text-white drop-shadow-md" />
                      </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                      msg.role === 'user' 
                      ? 'bg-catbox-accent text-white rounded-br-none' 
                      : 'bg-white/10 border border-white/10 rounded-bl-none'
                  }`}>
                      {msg.type === 'text' && <p className="text-sm leading-relaxed">{msg.content}</p>}
                      {msg.type === 'image' && (
                          <div className="space-y-2">
                             <img src={msg.content} className="rounded-xl w-full border border-white/10" />
                             <div className="flex items-center gap-2 text-[10px] opacity-70 uppercase font-bold">
                                <Icons.Check size={12} /> {t.save}
                             </div>
                          </div>
                      )}
                  </div>
              </div>
          ))}
          {isLoading && (
              <div className="flex justify-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white/20 shadow-xl mt-1 ${
                       variant === 'home' 
                       ? 'bg-gradient-to-br from-blue-500 to-cyan-600' 
                       : 'bg-gradient-to-br from-purple-600 to-pink-600'
                  }`}>
                      <Icons.Sparkles size={20} className="text-white animate-spin-slow" />
                  </div>
                  <div className="bg-white/10 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce delay-150"></div>
                      <span className="text-xs text-gray-400 ml-2">{t.chat_generating}</span>
                  </div>
              </div>
          )}
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t border-white/10 space-y-3 ${variant === 'editor' ? 'bg-black/50' : 'bg-catbox-panel'}`}>
          
          {/* Mode Selectors */}
          <div className="flex gap-2">
             {settings.aiModels.photo && (
                 <button 
                   onClick={() => setActiveMode('photo')}
                   className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${activeMode === 'photo' ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}
                 >
                    <Icons.Image size={14} /> {t.mode_photo}
                 </button>
             )}
             {settings.aiModels.video && (
                 <button 
                   onClick={() => setActiveMode('video')}
                   className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${activeMode === 'video' ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}
                 >
                    <Icons.Image size={14} /> {t.mode_video}
                 </button>
             )}
          </div>

          <div className="flex items-center gap-3">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.chat_placeholder}
                className="flex-1 bg-black/30 border border-white/20 rounded-2xl p-4 text-white focus:outline-none focus:border-catbox-accent focus:bg-black/50 transition-all placeholder-gray-600"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="p-4 bg-catbox-accent rounded-2xl text-white hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-catbox-accent/20 active:scale-95"
              >
                  <Icons.Send size={24} />
              </button>
          </div>
      </div>
    </div>
  );
};

export default AIAssistant;