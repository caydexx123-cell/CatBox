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
  Zap
} from 'lucide-react';

// "Super Cat" - Normal Mode
const SuperCat = ({ size = 24, className = "", isAngry = false }: { size?: number, className?: string, isAngry?: boolean }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Base Head Shape */}
    <path 
      d="M12 3C8 3 4.5 5 2.5 8C2 10 2 15 3 17C4 19 8 22 12 22C16 22 20 19 21 17C22 15 22 10 21.5 8C19.5 5 16 3 12 3Z" 
      fill={isAngry ? "#000000" : "#1e293b"} 
      stroke={isAngry ? "#ef4444" : "white"} 
      strokeWidth="1.5"
    />
    
    {/* Ears */}
    <path d="M4 8L2 2L9 5" fill={isAngry ? "#000000" : "#1e293b"} stroke={isAngry ? "#ef4444" : "white"} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M20 8L22 2L15 5" fill={isAngry ? "#000000" : "#1e293b"} stroke={isAngry ? "#ef4444" : "white"} strokeWidth="1.5" strokeLinejoin="round"/>

    {/* Eyes */}
    {isAngry ? (
      <>
        {/* Angry Eyes */}
        <path d="M6 11L10 13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 11L14 13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="14" r="2" fill="#ef4444" />
        <circle cx="16" cy="14" r="2" fill="#ef4444" />
      </>
    ) : (
      <>
        {/* Cute Eyes */}
        <circle cx="8" cy="13" r="3" fill="white" />
        <circle cx="16" cy="13" r="3" fill="white" />
        <circle cx="8" cy="13" r="1.5" fill="black" />
        <circle cx="16" cy="13" r="1.5" fill="black" />
        <circle cx="9" cy="12" r="0.8" fill="white" />
        <circle cx="17" cy="12" r="0.8" fill="white" />
      </>
    )}

    {/* Nose */}
    <path d="M11 17L12 18L13 17" stroke={isAngry ? "#ef4444" : "white"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    
    {/* Whiskers */}
    <path d="M3 14H1" stroke={isAngry ? "#ef4444" : "white"} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 16H1" stroke={isAngry ? "#ef4444" : "white"} strokeWidth="1.5" strokeLinecap="round" />
    
    <path d="M21 14H23" stroke={isAngry ? "#ef4444" : "white"} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M21 16H23" stroke={isAngry ? "#ef4444" : "white"} strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Angry Mouth/Teeth effect */}
    {isAngry && (
       <path d="M10 20L11 19L12 20L13 19L14 20" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

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
  Zap 
};