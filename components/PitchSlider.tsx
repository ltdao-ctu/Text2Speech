import React from 'react';

interface PitchSliderProps {
  pitch: number;
  onPitchChange: (pitch: number) => void;
}

export const PitchSlider: React.FC<PitchSliderProps> = ({ pitch, onPitchChange }) => {
  return (
    <div className="w-full">
      <label htmlFor="pitch-slider" className="block text-sm font-medium text-gray-300 mb-2">
        Pitch ({pitch > 0 ? '+' : ''}{pitch}%)
      </label>
      <input
        id="pitch-slider"
        type="range"
        min="-20"
        max="20"
        step="1"
        value={pitch}
        onChange={(e) => onPitchChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
    </div>
  );
};
