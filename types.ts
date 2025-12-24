
export type ToolType = 'brush' | 'eraser' | 'fill';

export type AppMode = 'home' | 'animation' | 'photo' | 'ai-chat' | 'gallery' | 'send' | 'settings';

export type Language = 'ru' | 'en' | 'zh';

export type TextStyle = 'default' | 'minecraft' | 'anime';

export interface Point {
  x: number;
  y: number;
}

export interface AnimationSettings {
  fps: number;
  onionSkin: boolean;
  isPlaying: boolean;
}

export interface DrawingState {
  color: string;
  brushSize: number;
  tool: ToolType;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'ai-gen' | 'video-gen';
  dataUrl: string; 
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  isOnline: boolean;
}

export interface AppSettings {
  language: Language;
  textStyle: TextStyle;
  optimizeFps: boolean; // NEW: FPS Boost setting
  aiModels: {
    photo: boolean;
    video: boolean;
  };
}

export const CANVAS_SIZE = 800;
