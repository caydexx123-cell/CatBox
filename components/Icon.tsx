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

// "Super Cat" - Clean, bold, vector-style cat head
const SuperCat = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Base Head Shape - Dark Blue/Slate */}
    <path 
      d="M12 3C8 3 4.5 5 2.5 8C2 10 2 15 3 17C4 19 8 22 12 22C16 22 20 19 21 17C22 15 22 10 21.5 8C19.5 5 16 3 12 3Z" 
      fill="#1e293b" 
      stroke="white" 
      strokeWidth="1.5"
    />
    
    {/* Ears - distinct and sticking out */}
    <path d="M4 8L2 2L9 5" fill="#1e293b" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M20 8L22 2L15 5" fill="#1e293b" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>

    {/* Big Cute Eyes */}
    <circle cx="8" cy="13" r="3" fill="white" />
    <circle cx="16" cy="13" r="3" fill="white" />
    <circle cx="8" cy="13" r="1.5" fill="black" />
    <circle cx="16" cy="13" r="1.5" fill="black" />
    
    {/* Highlights in eyes */}
    <circle cx="9" cy="12" r="0.8" fill="white" />
    <circle cx="17" cy="12" r="0.8" fill="white" />

    {/* Nose */}
    <path d="M11 17L12 18L13 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    
    {/* Whiskers - Critical for cat look */}
    <path d="M3 14H1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 16H1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    
    <path d="M21 14H23" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M21 16H23" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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
  Cat: SuperCat, // The new, much better cat
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
  Zap // Lightning bolt for performance mode
};