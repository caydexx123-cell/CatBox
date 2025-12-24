import React, { useState } from 'react';
import { Icons } from './Icon';
import { GoogleGenAI } from "@google/genai";

interface KinoGenProps {
  onVideoGenerated: (videoUrl: string) => void;
  onClose: () => void;
  initialImage?: string;
}

const KinoGen: React.FC<KinoGenProps> = ({ onVideoGenerated, onClose, initialImage }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Internal stage for "Story Mode": 'prompt' -> 'generating_image' -> 'ready_to_animate' -> 'generating_video'
  const [generatedBaseImage, setGeneratedBaseImage] = useState<string | null>(initialImage || null);

  const checkApiKey = async (): Promise<boolean> => {
    const win = window as any;
    if (win.aistudio) {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setStatus("Ожидание ключа API...");
        await win.aistudio.openSelectKey();
        return true; 
      }
      return true;
    }
    return true; 
  };

  const generateImageFirst = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setStatus('Gemini 2.5 рисует кадр...');
    setError(null);

    try {
        await checkApiKey();
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
        });

        let found = false;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    const dataUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                    setGeneratedBaseImage(dataUrl);
                    found = true;
                    break;
                }
            }
        }
        if (!found) throw new Error("Не удалось создать изображение");
        setPrompt(''); // Clear prompt for next step (motion description)
    } catch (e: any) {
        setError("Ошибка генерации фото: " + e.message);
    } finally {
        setIsLoading(false);
        setStatus('');
    }
  };

  const handleGenerateVideo = async () => {
    const finalPrompt = prompt.trim() || "Cinematic motion, high quality"; // Default prompt if empty
    setIsLoading(true);
    setError(null);
    setStatus('Инициализация Veo...');

    try {
      await checkApiKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      setStatus('Veo создает магию...');
      let operation;

      if (generatedBaseImage) {
        // Image-to-Video
        const base64Data = generatedBaseImage.split(',')[1];
        const mimeType = generatedBaseImage.split(';')[0].split(':')[1];

        operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: finalPrompt,
            image: { imageBytes: base64Data, mimeType: mimeType },
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
        });
      } else {
         // Text-to-Video
         operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: finalPrompt,
            config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
        });
      }

      setStatus('Рендеринг (это может занять время)...');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        setStatus('Обработка кадров...');
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        const vidResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await vidResponse.blob();
        const localUrl = URL.createObjectURL(blob);
        onVideoGenerated(localUrl);
      } else {
        throw new Error("Нет URI видео в ответе");
      }

    } catch (err: any) {
      setError('Сбой продакшена: ' + (err.message || 'Попробуйте снова.'));
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-catbox-dark flex flex-col animate-fade-in">
      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-catbox-panel/80 backdrop-blur-md">
        <h2 className="text-xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
          <Icons.Clapperboard size={20} className="text-red-400" />
          KINO Studio
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/10">
          <Icons.X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 space-y-6 overflow-y-auto">
        
        {!generatedBaseImage && (
            <div className="text-center space-y-2 max-w-md mt-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <Icons.Clapperboard size={32} className="text-red-400" />
                </div>
                <h3 className="text-xl font-black text-white">ШАГ 1: Идея</h3>
                <p className="text-gray-400 text-sm">Опишите сцену, и Gemini 2.5 нарисует основу для фильма.</p>
            </div>
        )}

        {generatedBaseImage && (
            <div className="w-full max-w-lg space-y-4 animate-fade-in">
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-catbox-accent shadow-2xl group">
                    <img src={generatedBaseImage} className="w-full h-full object-cover" />
                    <button 
                        onClick={() => setGeneratedBaseImage(null)}
                        className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                        title="Удалить и начать заново"
                    >
                        <Icons.Trash size={16} />
                    </button>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-black text-white">ШАГ 2: Мотор!</h3>
                    <p className="text-gray-400 text-sm">Опишите, как это должно двигаться (или оставьте пустым для ИИ-магии).</p>
                </div>
            </div>
        )}

        <div className="w-full max-w-md space-y-4">
          <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={generatedBaseImage ? "Пример: Камера медленно наезжает, ветер раздувает волосы, кинематографичный свет..." : "Пример: Киберпанк кот едет на неоновом мотоцикле под дождем..."}
              className="w-full h-24 bg-catbox-panel border border-white/20 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none shadow-inner text-sm"
          />
          
          {status && <div className="text-catbox-accent text-sm text-center font-bold animate-pulse">{status}</div>}
          {error && <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</div>}

          <div className="flex flex-col gap-3">
            {!generatedBaseImage ? (
                <button
                    onClick={generateImageFirst}
                    disabled={isLoading || !prompt.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all border border-white/10 ${
                    isLoading ? 'bg-gray-800 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] text-white'
                    }`}
                >
                    {isLoading ? 'Рисуем...' : <><Icons.Sparkles size={20} /> Создать кадр (Gemini 2.5)</>}
                </button>
            ) : (
                <button
                    onClick={handleGenerateVideo}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all border border-white/10 ${
                    isLoading ? 'bg-gray-800 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.4)] text-white'
                    }`}
                >
                    {isLoading ? 'Снимаем...' : <><Icons.Film size={20} /> Снять фильм (Veo)</>}
                </button>
            )}

            {/* Direct Text-to-Video Option (Hidden if image exists to enforce flow, or explicit option) */}
            {!generatedBaseImage && (
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-xs">ИЛИ</span>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>
            )}
            
            {!generatedBaseImage && (
                <button
                    onClick={handleGenerateVideo}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                >
                    <Icons.Film size={16} /> Сразу видео (Text-to-Video)
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KinoGen;