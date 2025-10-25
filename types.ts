
export interface VoiceOption {
  id: string;
  name: string;
}

// Add mammoth to the window object for TypeScript
declare global {
  interface Window {
    mammoth: any;
  }
}
