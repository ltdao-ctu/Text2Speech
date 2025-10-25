import React, { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const playbackSpeedOptions = [0.5, 1, 1.5, 2];

  // Effect to load and play new audio
  useEffect(() => {
    if (audioUrl && audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch(error => console.log("Autoplay was prevented:", error));
        // Ensure the current playback rate is set on the new audio element
        audioRef.current.playbackRate = playbackRate;
    }
  }, [audioUrl, playbackRate]);

  // Effect to update playback rate when the user changes it
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaybackRate(Number(e.target.value));
  };

  return (
    <div className="w-full mt-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Generated Audio</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <audio ref={audioRef} controls src={audioUrl} className="w-full">
                Your browser does not support the audio element.
            </audio>

            <div className="relative flex-shrink-0">
                <label htmlFor="speed-select" className="sr-only">Playback Speed</label>
                <select
                    id="speed-select"
                    value={playbackRate}
                    onChange={handleSpeedChange}
                    className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Playback speed"
                >
                    {playbackSpeedOptions.map((speed) => (
                      <option key={speed} value={speed}>
                        {speed}x
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    </div>
  );
};
