import React from 'react';
import { Icons } from './Icon';
import { AppSettings, Language, TextStyle } from '../types';
import { translations } from '../utils/translations';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdateSettings, onClose }) => {
  const t = translations[settings.language];

  const toggleModel = (model: 'photo' | 'video') => {
    onUpdateSettings({
      ...settings,
      aiModels: {
        ...settings.aiModels,
        [model]: !settings.aiModels[model]
      }
    });
  };

  const setLang = (lang: Language) => {
    onUpdateSettings({ ...settings, language: lang });
  };

  const setStyle = (style: TextStyle) => {
      onUpdateSettings({ ...settings, textStyle: style });
  };

  const toggleFps = () => {
    onUpdateSettings({ ...settings, optimizeFps: !settings.optimizeFps });
  };

  return (
    <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md bg-catbox-panel border border-white/10 rounded-3xl p-6 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Icons.Settings size={28} className="text-gray-400" />
            {t.settings_title}
          </h2>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
            <Icons.X size={20} />
          </button>
        </div>

        {/* API KEY Section - IMPORTANT */}
        <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
           <label className="text-xs text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
             <Icons.Sparkles size={12} /> {t.api_title}
           </label>
           <p className="text-[10px] text-gray-500">{t.api_desc}</p>
           
           <div className="flex gap-2">
             <input 
               type="text" 
               value={settings.apiKey}
               onChange={(e) => onUpdateSettings({ ...settings, apiKey: e.target.value })}
               placeholder={t.api_placeholder}
               className="w-full bg-black/30 border border-white/20 rounded-xl p-3 text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
             />
           </div>
           
           <a 
             href="https://aistudio.google.com/app/api-keys" 
             target="_blank" 
             rel="noreferrer"
             className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase mt-1"
           >
             {t.api_get} <Icons.ArrowRight size={10} />
           </a>
        </div>

        {/* FPS / Performance Section */}
        <div className="space-y-4">
           <div>
             <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.opt_title}</label>
             <p className="text-[10px] text-gray-500 mt-1">{t.opt_desc}</p>
           </div>
           
           <button 
             onClick={toggleFps}
             className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                 settings.optimizeFps 
                 ? 'bg-yellow-500/20 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]' 
                 : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
             }`}
           >
              <div className="flex items-center gap-3">
                 <Icons.Zap size={24} className={settings.optimizeFps ? 'text-yellow-400 fill-current' : 'text-gray-600'} />
                 <span className={`font-bold ${settings.optimizeFps ? 'text-yellow-100' : 'text-gray-400'}`}>{t.opt_fps}</span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.optimizeFps ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.optimizeFps ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
           </button>
        </div>

        {/* Language Section */}
        <div className="space-y-3">
           <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.lang_select}</label>
           <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setLang('ru')}
                className={`py-3 rounded-xl font-bold transition-all ${settings.language === 'ru' ? 'bg-catbox-accent text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                Русский
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`py-3 rounded-xl font-bold transition-all ${settings.language === 'en' ? 'bg-catbox-accent text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLang('zh')}
                className={`py-3 rounded-xl font-bold transition-all ${settings.language === 'zh' ? 'bg-catbox-accent text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                中文
              </button>
           </div>
        </div>

        {/* Font Style Section */}
        <div className="space-y-3">
           <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.text_style}</label>
           <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setStyle('default')}
                className={`py-3 rounded-xl font-bold transition-all ${settings.textStyle === 'default' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                {t.style_default}
              </button>
              <button 
                onClick={() => setStyle('minecraft')}
                className={`py-3 rounded-xl font-minecraft text-xs transition-all ${settings.textStyle === 'minecraft' ? 'bg-green-600 text-white shadow-[0_4px_0_#14532d] translate-y-[-2px]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                {t.style_minecraft}
              </button>
              <button 
                onClick={() => setStyle('anime')}
                className={`py-3 rounded-xl font-anime transition-all ${settings.textStyle === 'anime' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                {t.style_anime}
              </button>
           </div>
        </div>

        {/* AI Configuration */}
        <div className="space-y-4">
           <div>
             <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.ai_config}</label>
             <p className="text-[10px] text-gray-500 mt-1">{t.ai_desc}</p>
           </div>
           
           <div className="space-y-3">
              {/* Photo Model Toggle */}
              <button 
                onClick={() => toggleModel('photo')}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                    settings.aiModels.photo 
                    ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]' 
                    : 'bg-white/5 border-white/5 text-gray-500 grayscale opacity-40 hover:opacity-60'
                }`}
              >
                 <div className="flex items-center gap-3">
                    <Icons.Image size={24} className={settings.aiModels.photo ? 'text-blue-300' : 'text-gray-600'} />
                    <span className={`font-bold ${settings.aiModels.photo ? 'text-blue-100' : 'text-gray-500'}`}>{t.model_photo}</span>
                 </div>
                 {settings.aiModels.photo ? (
                    <Icons.Check size={20} className="text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,1)]" />
                 ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-700 bg-black/20"></div>
                 )}
              </button>

              {/* Video Model Toggle */}
              <button 
                onClick={() => toggleModel('video')}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                    settings.aiModels.video 
                    ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]' 
                    : 'bg-white/5 border-white/5 text-gray-500 grayscale opacity-40 hover:opacity-60'
                }`}
              >
                 <div className="flex items-center gap-3">
                    <Icons.Film size={24} className={settings.aiModels.video ? 'text-purple-300' : 'text-gray-600'} />
                    <span className={`font-bold ${settings.aiModels.video ? 'text-purple-100' : 'text-gray-500'}`}>{t.model_video}</span>
                 </div>
                 {settings.aiModels.video ? (
                    <Icons.Check size={20} className="text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,1)]" />
                 ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-700 bg-black/20"></div>
                 )}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;