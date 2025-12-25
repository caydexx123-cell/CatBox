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
  variant?: 'home' | 'editor'; 
  onUpdateSettings?: (newSettings: AppSettings) => void;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  type: 'text' | 'image';
  content: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onImageGenerated, onVideoGenerated, onClose, settings, variant = 'home', onUpdateSettings }) => {
  const t = translations[settings.language];
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'ai', type: 'text', content: t.chat_welcome }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // API Key Validation State
  const [tempKey, setTempKey] = useState('');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  
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

  const validateAndSaveKey = async () => {
      const cleanKey = tempKey.trim();
      if (!cleanKey) return;
      
      // Basic Format Check
      if (!cleanKey.startsWith('AIza')) {
          setKeyError(t.api_format_err);
          return;
      }

      setIsValidatingKey(true);
      setKeyError(null);

      try {
          // REAL VALIDATION: Check against a STABLE TEXT model
          const ai = new GoogleGenAI({ apiKey: cleanKey });
          
          // Using gemini-2.0-flash for validation (lightweight)
          await ai.models.generateContent({
              model: 'gemini-2.0-flash', 
              contents: 'Ping',
          });

          // If no error thrown, we are good!
          if (onUpdateSettings) {
              onUpdateSettings({ ...settings, apiKey: cleanKey });
          }
      } catch (e: any) {
          console.error("Key Validation Failed", e);
          let errorMsg = t.api_fail;
          if (e.message?.includes('404') || e.message?.includes('NOT_FOUND')) {
             errorMsg = "Ошибка 404: Модель не найдена (проверьте права ключа)";
          } else if (e.message?.includes('403') || e.message?.includes('PERMISSION_DENIED')) {
             errorMsg = "Ошибка 403: Неверный ключ или нет доступа";
          }
          setKeyError(errorMsg);
      } finally {
          setIsValidatingKey(false);
      }
  };

  // If no API Key, show the lock screen
  if (!settings.apiKey) {
      return (
        <div className={`absolute inset-0 z-50 bg-catbox-dark flex flex-col items-center justify-center p-6 animate-fade-in ${variant === 'editor' ? 'bg-black/95 backdrop-blur-xl' : ''}`}>
             <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Icons.X size={24} />
             </button>

             <div className="w-full max-w-md bg-catbox-panel border border-white/10 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
                 <div className={`w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto border border-white/10 ${keyError ? 'border-red-500/50 bg-red-900/20 text-red-400' : 'text-blue-400'}`}>
                     {keyError ? <Icons.X size={40} /> : <Icons.Sparkles size={40} className="animate-pulse" />}
                 </div>
                 
                 <div>
                    <h2 className="text-2xl font-black text-white">{t.api_missing}</h2>
                    <p className="text-gray-400 mt-2 text-sm">{t.api_desc}</p>
                 </div>

                 <div className="space-y-2">
                    <input 
                        type="text" 
                        value={tempKey}
                        onChange={(e) => {
                            setTempKey(e.target.value);
                            setKeyError(null);
                        }}
                        placeholder={t.api_placeholder}
                        className={`w-full bg-black/30 border rounded-xl p-4 text-center text-white text-sm font-mono focus:outline-none transition-colors ${keyError ? 'border-red-500 text-red-200' : 'border-white/20 focus:border-blue-500'}`}
                    />
                    {keyError && <p className="text-xs text-red-400 font-bold">{keyError}</p>}
                 </div>

                 <button 
                    onClick={validateAndSaveKey}
                    disabled={!tempKey.trim() || isValidatingKey}
                    className={`w-full font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                        isValidatingKey 
                        ? 'bg-gray-600 text-gray-300 cursor-wait' 
                        : (keyError ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]')
                    }`}
                 >
                    {isValidatingKey ? (
                        <><div className="loader w-4 h-4 border-2"></div> {t.api_validating}</>
                    ) : (
                        t.api_save
                    )}
                 </button>

                 <div className="pt-4 border-t border-white/10">
                     <a 
                        href="https://aistudio.google.com/app/api-keys" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-400 text-xs font-bold uppercase hover:text-white transition-colors flex items-center justify-center gap-2"
                     >
                        {t.api_get} <Icons.ArrowRight size={12} />
                     </a>
                 </div>
             </div>
        </div>
      );
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now().toString() + 'u', role: 'user', type: 'text', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
       const ai = new GoogleGenAI({ apiKey: settings.apiKey });
       
       // Construct a SAFE prompt.
       // Avoid "square 1:1" and "photo" keywords which trigger safety filters falsely.
       let finalPrompt = inputValue;
       
       if (activeMode === 'video') {
           finalPrompt += ", cinematic, wide view";
       } else {
           finalPrompt += ", digital art"; 
       }

       // Use the correct IMAGE model: gemini-2.5-flash-image
       // It automatically returns 1:1 unless specified otherwise in config (but config is limited for this model)
       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] },
       });
        
       let found = false;
       if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), role: 'ai', type: 'image', content: url }]);
                onImageGenerated(url);
                found = true;
                break;
            }
            }
       }
       
       if (!found) {
           // Check if it's a text refusal (Policy violation usually comes here)
           const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
           if (text) {
               // Translate safety error to friendly message if possible
               if (text.includes("policy") || text.includes("violates")) {
                   setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'ai', type: 'text', content: "⚠️ ИИ отказался рисовать это из-за политики безопасности. Попробуйте перефразировать запрос (избегайте реализма людей)." }]);
               } else {
                   setMessages(prev => [...prev, { id: Date.now().toString() + 't', role: 'ai', type: 'text', content: text }]);
               }
           } else {
               throw new Error("No content generated");
           }
       }

    } catch (e: any) {
        console.error(e);
        let errorMsg = 'Error: ' + (e.message || "Unknown error");
        if (errorMsg.includes("404")) errorMsg = "Модель недоступна (404). Проверьте ключ.";
        setMessages(prev => [...prev, { id: Date.now().toString() + 'err', role: 'ai', type: 'text', content: errorMsg }]);
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