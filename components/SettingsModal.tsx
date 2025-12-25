import React, { useState } from 'react';
import { Icons } from './Icon';
import { AppSettings, Language, TextStyle, AppTheme } from '../types';
import { translations } from '../utils/translations';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdateSettings, onClose }) => {
  const t = translations[settings.language];
  const [resetConfirm, setResetConfirm] = useState(false);

  // Simple format validation: Starts with AIza and is roughly the right length
  const isValidFormat = (key: string) => key.startsWith('AIza') && key.length > 30;
  const isKeyInvalid = settings.apiKey.length > 0 && !isValidFormat(settings.apiKey);

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

  const setTheme = (theme: AppTheme) => {
      onUpdateSettings({ ...settings, theme: theme });
  }

  const toggleFps = () => {
    onUpdateSettings({ ...settings, optimizeFps: !settings.optimizeFps });
  };

  const handleReset = () => {
      if (!resetConfirm) {
          setResetConfirm(true);
          return;
      }
      // Nuke everything
      localStorage.clear();
      window.location.reload();
  };

  return (
    <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#1e293b]/90 border border-white/10 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
          <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
            <Icons.Settings size={32} className="text-catbox-accent" />
            {t.settings_title}
          </h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors">
            <Icons.X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

            {/* API KEY CARD */}
            <div className={`bg-black/20 p-5 rounded-2xl border space-y-3 shadow-inner transition-colors ${isKeyInvalid ? 'border-red-500/50 bg-red-900/10' : 'border-white/5'}`}>
                <div className="flex items-center justify-between">
                    <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isKeyInvalid ? 'text-red-400' : 'text-blue-400'}`}>
                        <Icons.Sparkles size={14} /> {t.api_title}
                    </label>
                    <a 
                        href="https://aistudio.google.com/app/api-keys" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        {t.api_get} <Icons.ArrowRight size={10} />
                    </a>
                </div>
                
                <div className="relative">
                    <input 
                    type="text" 
                    value={settings.apiKey}
                    onChange={(e) => onUpdateSettings({ ...settings, apiKey: e.target.value })}
                    placeholder={t.api_placeholder}
                    className={`w-full bg-black/40 border rounded-xl p-3 text-white text-xs font-mono focus:outline-none transition-colors ${isKeyInvalid ? 'border-red-500 text-red-300' : 'border-white/10 focus:border-blue-500'}`}
                    />
                    {settings.apiKey.length > 0 && (
                        <div className="absolute right-3 top-3">
                            {isKeyInvalid ? (
                                <Icons.X size={16} className="text-red-500" />
                            ) : (
                                <Icons.Check size={16} className="text-green-500" />
                            )}
                        </div>
                    )}
                </div>
                {isKeyInvalid ? (
                    <p className="text-[10px] text-red-400 font-bold">{t.api_format_err}</p>
                ) : (
                    <p className="text-[10px] text-gray-500">{t.api_desc}</p>
                )}
            </div>

            {/* AI CONFIGURATION TOGGLES (Restored) */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">{t.ai_config}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => toggleModel('photo')}
                        className={`p-3 rounded-xl flex items-center gap-3 transition-all border ${
                            settings.aiModels.photo 
                            ? 'bg-catbox-secondary/20 border-catbox-secondary text-white' 
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        <div className={`p-2 rounded-lg ${settings.aiModels.photo ? 'bg-catbox-secondary text-white' : 'bg-white/10'}`}>
                            <Icons.Image size={18} />
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-bold">{t.model_photo}</div>
                            <div className="text-[9px] opacity-60">1:1</div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ml-auto ${settings.aiModels.photo ? 'bg-catbox-secondary shadow-[0_0_8px_rgba(236,72,153,0.6)]' : 'bg-gray-700'}`}></div>
                    </button>

                    <button 
                        onClick={() => toggleModel('video')}
                        className={`p-3 rounded-xl flex items-center gap-3 transition-all border ${
                            settings.aiModels.video 
                            ? 'bg-catbox-accent/20 border-catbox-accent text-white' 
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        <div className={`p-2 rounded-lg ${settings.aiModels.video ? 'bg-catbox-accent text-white' : 'bg-white/10'}`}>
                            <Icons.Film size={18} />
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-bold">{t.model_video}</div>
                            <div className="text-[9px] opacity-60">16:9</div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ml-auto ${settings.aiModels.video ? 'bg-catbox-accent shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'bg-gray-700'}`}></div>
                    </button>
                </div>
                <p className="text-[10px] text-gray-500 px-1">{t.ai_desc}</p>
            </div>

            {/* APPEARANCE SECTION */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Внешний вид</h3>
                
                {/* Theme Selector */}
                <div className="bg-white/5 rounded-2xl p-1.5 grid grid-cols-4 gap-1">
                    {[
                        { id: 'default', icon: Icons.Cat, label: t.theme_default, color: 'text-white' },
                        { id: 'newyear', icon: Icons.Snowflake, label: t.theme_newyear, color: 'text-blue-300' },
                        { id: 'halloween', icon: Icons.Ghost, label: t.theme_halloween, color: 'text-orange-400' },
                        { id: 'easter', icon: Icons.Egg, label: t.theme_easter, color: 'text-pink-300' }
                    ].map((theme) => (
                        <button 
                            key={theme.id}
                            onClick={() => setTheme(theme.id as AppTheme)}
                            className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                                settings.theme === theme.id 
                                ? 'bg-white/10 shadow-lg border border-white/10' 
                                : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                            }`}
                        >
                            <theme.icon size={20} className={theme.color} theme={theme.id} />
                            <span className="text-[9px] font-bold">{theme.label}</span>
                        </button>
                    ))}
                </div>

                {/* Font Style */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'default', label: t.style_default, font: '' },
                        { id: 'minecraft', label: t.style_minecraft, font: 'font-minecraft text-[10px]' },
                        { id: 'anime', label: t.style_anime, font: 'font-anime' }
                    ].map((style) => (
                        <button 
                            key={style.id}
                            onClick={() => setStyle(style.id as TextStyle)}
                            className={`py-3 rounded-xl border transition-all text-xs font-bold ${
                                settings.textStyle === style.id 
                                ? 'bg-catbox-accent border-white/20 text-white shadow-lg' 
                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                            } ${style.font}`}
                        >
                            {style.label}
                        </button>
                    ))}
                </div>

                {/* Language */}
                <div className="flex bg-white/5 rounded-xl p-1">
                    {['ru', 'en', 'zh'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLang(lang as Language)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                settings.language === lang 
                                ? 'bg-white text-black shadow-sm' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {lang === 'ru' ? 'Рус' : lang === 'en' ? 'Eng' : '中'}
                        </button>
                    ))}
                </div>
            </div>

            {/* PERFORMANCE & NETWORK */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Система</h3>
                
                {/* FPS Boost */}
                <button 
                    onClick={toggleFps}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${settings.optimizeFps ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-gray-400'}`}>
                            <Icons.Zap size={20} />
                        </div>
                        <div className="text-left">
                            <div className={`font-bold text-sm ${settings.optimizeFps ? 'text-white' : 'text-gray-400'}`}>{t.opt_fps}</div>
                            <div className="text-[10px] text-gray-500">{t.opt_desc}</div>
                        </div>
                    </div>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${settings.optimizeFps ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.optimizeFps ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                </button>

                {/* Multiplayer */}
                <div className="relative">
                    <button 
                        onClick={() => onUpdateSettings({ ...settings, enableSend: !settings.enableSend })}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 flex items-center justify-between group transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${settings.enableSend ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'}`}>
                                <Icons.Wifi size={20} />
                            </div>
                            <div className="text-left">
                                <div className={`font-bold text-sm ${settings.enableSend ? 'text-white' : 'text-gray-400'}`}>SEND (Multiplayer)</div>
                            </div>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${settings.enableSend ? 'bg-green-500' : 'bg-gray-700'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.enableSend ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                    </button>
                    <div className="absolute top-1 right-1 text-[8px] bg-red-900/80 text-red-200 px-2 py-0.5 rounded-full border border-red-500/30 pointer-events-none">
                        ⚠️ Unstable
                    </div>
                </div>
            </div>

            {/* DANGER ZONE - RESET */}
            <div className="pt-6 border-t border-white/5">
                <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-red-400">
                         <Icons.Trash size={16} />
                         <span className="text-xs font-bold uppercase tracking-widest">{t.reset_title}</span>
                    </div>
                    
                    <p className="text-xs text-red-300/70 leading-relaxed font-bold bg-red-900/20 p-2 rounded">
                         {t.reset_warn}
                    </p>

                    <button 
                        onClick={handleReset}
                        className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                            resetConfirm 
                            ? 'bg-red-600 text-white animate-pulse' 
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                    >
                        {resetConfirm ? t.reset_confirm : t.reset_btn}
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;