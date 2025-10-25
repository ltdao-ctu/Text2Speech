
import React from 'react';
import { VoiceOption } from '../types';
import { PlayIcon, LoadingSpinner } from './icons';

interface VoiceSelectorProps {
  voices: VoiceOption[];
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  onPreviewVoice: (voiceId: string) => void;
  isPreviewing: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ voices, selectedVoice, onVoiceChange, onPreviewVoice, isPreviewing }) => {
  return (
    <div className="w-full">
      <label htmlFor="voice-select" className="block text-sm font-medium text-gray-300 mb-2">
        Choose a Voice
      </label>
      <div className="flex items-center gap-2">
        <select
          id="voice-select"
          value={selectedVoice}
          onChange={(e) => onVoiceChange(e.target.value)}
          className="flex-grow px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
        <button
            type="button"
            onClick={() => onPreviewVoice(selectedVoice)}
            disabled={isPreviewing}
            className="flex-shrink-0 flex items-center justify-center h-10 w-10 bg-indigo-600 rounded-md text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            aria-label="Preview selected voice"
        >
            {isPreviewing ? (
                <LoadingSpinner className="w-5 h-5 animate-spin" />
            ) : (
                <PlayIcon className="w-5 h-5" />
            )}
        </button>
      </div>
    </div>
  );
};
