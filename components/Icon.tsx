
import React from 'react';
import { 
  Pencil, 
  Eraser, 
  PaintBucket, 
  Play, 
  Pause, 
  Plus, 
  Layers, 
  Trash2, 
  Settings,
  Undo,
  Redo,
  Copy,
  Home,
  Image as ImageIcon,
  Film,
  Sparkles,
  Folder,
  Download,
  ArrowRight,
  X,
  Check,
  Clapperboard,
  Wand2,
  Send,
  Wifi,
  Users,
  User,
  Zap,
  Ghost,
  Snowflake,
  Egg,
  FolderDown
} from 'lucide-react';
import { AppTheme } from '../types';

// "Super Cat" - Refactored to fit 24x24 bounds properly
const SuperCat = ({ size = 24, className = "", isAngry = false, theme = 'default' }: { size?: number, className?: string, isAngry?: boolean, theme?: AppTheme }) => {
  
  const getFill = () => {
    if (theme === 'halloween') return '#4ade80';
    if (theme === 'easter') return '#ffffff';
    if (isAngry) return '#000000';
    return '#1e293b'; 
  };

  const getStroke = () => {
    if (theme === 'halloween') return '#166534';
    if (theme === 'easter') return '#f472b6';
    if (isAngry) return '#ef4444';
    return 'white';
  };

  const isBunny = theme === 'easter';

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* BUNNY EARS (Easter) - Adjusted coordinates to stay inside box */}
      {isBunny && (
         <>
          <path d="M9 8V3C9 1.5 7 1.5 7 3C7 6 6 8 6 8" fill={getFill()} stroke={getStroke()} strokeWidth="1.5" />
          <path d="M15 8V3C15 1.5 17 1.5 17 3C17 6 18 8 18 8" fill={getFill()} stroke={getStroke()} strokeWidth="1.5" />
          {/* Inner Ear Detail */}
          <path d="M8 4V6" stroke="#fbcfe8" strokeWidth="1" />
          <path d="M16 4V6" stroke="#fbcfe8" strokeWidth="1" />
         </>
      )}

      {/* CAT EARS (Default) */}
      {!isBunny && (
        <>
          <path d="M5 9L3 3L10 6" fill={getFill()} stroke={getStroke()} strokeWidth="1.5" />
          <path d="M19 9L21 3L14 6" fill={getFill()} stroke={getStroke()} strokeWidth="1.5" />
        </>
      )}

      {/* NEW YEAR HAT - Adjusted position */}
      {theme === 'newyear' && !isBunny && (
        <>
          <path d="M7 6L12 1L17 6" fill="#ef4444" stroke="#ef4444" strokeWidth="1"/>
          <circle cx="12" cy="1" r="1.5" fill="white" />
          <path d="M6 8C6 8 8 7 12 7C16 7 18 8 18 8" stroke="white" strokeWidth="2" />
        </>
      )}

      {/* Base Head Shape (Squatter to fit ears) */}
      <path 
        d="M12 6C8 6 5 8 4 11C3.5 12.5 3.5 16 4.5 18C5.5 20 8.5 22 12 22C15.5 22 18.5 20 19.5 18C20.5 16 20.5 12.5 20 11C19 8 16 6 12 6Z" 
        fill={getFill()} 
        stroke={getStroke()} 
        strokeWidth="1.5"
      />

      {/* Eyes */}
      {isAngry ? (
        <>
          <path d="M7 13L10 15" stroke="#ef4444" strokeWidth="2" />
          <path d="M17 13L14 15" stroke="#ef4444" strokeWidth="2" />
          <circle cx="8.5" cy="15.5" r="1.5" fill="#ef4444" />
          <circle cx="15.5" cy="15.5" r="1.5" fill="#ef4444" />
        </>
      ) : (
        <>
          <circle cx="8.5" cy="14" r="2.5" fill="white" />
          <circle cx="15.5" cy="14" r="2.5" fill="white" />
          
          <circle cx="9" cy="14" r="1.5" fill={theme === 'halloween' ? '#ef4444' : (theme === 'easter' ? '#db2777' : 'black')} />
          <circle cx="15" cy="14" r="1.5" fill={theme === 'halloween' ? '#ef4444' : (theme === 'easter' ? '#db2777' : 'black')} />
          
          <circle cx="9.5" cy="13.5" r="0.5" fill="white" />
          <circle cx="15.5" cy="13.5" r="0.5" fill="white" />
        </>
      )}

      {/* Nose & Mouth */}
      <path d="M11.5 18L12 18.5L12.5 18" stroke={getStroke()} strokeWidth="1.5" fill="none"/>
      
      {/* Whiskers - Shortened slightly */}
      <path d="M4 15H2" stroke={getStroke()} strokeWidth="1.5" opacity="0.6"/>
      <path d="M4 17H2" stroke={getStroke()} strokeWidth="1.5" opacity="0.6"/>
      
      <path d="M20 15H22" stroke={getStroke()} strokeWidth="1.5" opacity="0.6"/>
      <path d="M20 17H22" stroke={getStroke()} strokeWidth="1.5" opacity="0.6"/>
      
      {/* Stitch/Angry Mouth */}
      {(isAngry || theme === 'halloween') && (
         <path d="M10 20L11 19.5L12 20L13 19.5L14 20" stroke={isAngry ? "#ef4444" : "#166534"} strokeWidth="1" />
      )}
    </svg>
  );
};

export const Icons = {
  Pencil,
  Eraser,
  Fill: PaintBucket,
  Play,
  Pause,
  Plus,
  Onion: Layers,
  Trash: Trash2,
  Settings,
  Undo,
  Redo,
  Cat: SuperCat,
  Copy,
  Home,
  Image: ImageIcon,
  Film,
  Sparkles,
  Folder,
  Download,
  ArrowRight,
  X,
  Check,
  Clapperboard,
  Wand: Wand2,
  Send,
  Wifi,
  Users,
  User,
  Zap,
  Ghost,
  Snowflake,
  Egg,
  FolderDown
};
