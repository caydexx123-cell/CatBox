import React, { useState } from 'react';
import { Icons } from './Icon';
import { GoogleGenAI } from "@google/genai";

interface AIGeneratorProps {
  onImageGenerated: (dataUrl: string) => void;
  onClose: () => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onImageGenerated, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Using gemini-2.5-flash-image (nano banana) as per guidelines for general image gen
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
      });

      let foundImage = false;
      // Parse response for image data
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const base64String = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            const dataUrl = `data:${mimeType};base64,${base64String}`;
            onImageGenerated(dataUrl);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        setError('No image was generated. Try a different prompt.');
      }

    } catch (err: any) {
      setError('Generation failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-catbox-dark flex flex-col animate-fade-in">
      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-catbox-panel/50 backdrop-blur-md">
        <h2 className="text-xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          <Icons.Sparkles size={20} className="text-blue-400" />
          AI Studio
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Icons.X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        
        <div className="text-center space-y-2 max-w-md">
           <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Icons.Sparkles size={40} className="text-blue-400 animate-pulse" />
           </div>
           <h3 className="text-2xl font-bold text-white">Dream it. Generate it.</h3>
           <p className="text-gray-400">Powered by Gemini 2.5. Describe what you want to see, and we'll create it for your folder.</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cyberpunk cat riding a hoverboard..."
            className="w-full h-32 bg-catbox-panel border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none shadow-inner"
          />
          
          {error && <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">{error}</div>}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              isLoading 
                ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] text-white active:scale-95'
            }`}
          >
            {isLoading ? (
              <>Generating...</>
            ) : (
              <>
                <Icons.Sparkles size={20} />
                Generate Art
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;