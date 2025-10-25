
import React, { useState, useEffect, useCallback } from 'react';
import { VoiceOption } from './types';
import { AVAILABLE_VOICES } from './constants';
import { readFilesAsText } from './services/fileReaderService';
import { generateSpeech } from './services/geminiService';
import { decode, decodeAudioData, audioBufferToWav } from './utils/audioUtils';
import { FileUpload } from './components/FileUpload';
import { VoiceSelector } from './components/VoiceSelector';
import { PitchSlider } from './components/PitchSlider';
import { AudioPlayer } from './components/AudioPlayer';
import { LoadingSpinner } from './components/icons';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(AVAILABLE_VOICES[0].id);
  const [pitch, setPitch] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext after a user interaction (e.g., component mount)
    // to comply with browser autoplay policies.
    setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
    setAudioUrl(null);
    setErrorMessage('');
  };

  const clearFiles = () => {
    setFiles([]);
    setAudioUrl(null);
  };

  const handlePreviewVoice = useCallback(async (voiceId: string) => {
    if (!audioContext || isPreviewing) {
        return;
    }
    setIsPreviewing(true);
    setErrorMessage(''); // Clear previous errors

    try {
        const previewText = "Hello, you can use this voice to read your text.";
        const base64Audio = await generateSpeech(previewText, voiceId, 0); // pitch=0 for preview
        
        if (!base64Audio) {
            throw new Error("Failed to generate preview audio.");
        }

        const audioBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();

    } catch (error: any) {
        console.error("Failed to preview voice:", error);
        setErrorMessage(error.message || "Failed to generate preview.");
    } finally {
        setIsPreviewing(false);
    }
  }, [audioContext, isPreviewing]);
  
  const handleGenerateAudio = useCallback(async () => {
    if (files.length === 0 || !audioContext) {
      setErrorMessage("Please select at least one file.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setAudioUrl(null);

    try {
      setStatusMessage("Reading file content...");
      const text = await readFilesAsText(files);

      if (!text.trim()) {
        throw new Error("No text content found in the selected files.");
      }

      setStatusMessage("Generating audio with Gemini...");
      const base64Audio = await generateSpeech(text, selectedVoice, pitch);
      
      if (!base64Audio) {
        throw new Error("Failed to generate audio.");
      }
      
      setStatusMessage("Decoding audio data...");
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
      
      setStatusMessage("Creating playable audio file...");
      const wavBlob = audioBufferToWav(audioBuffer);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  }, [files, selectedVoice, pitch, audioContext]);
  
  const canGenerate = files.length > 0 && !isProcessing;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-indigo-900/50 border border-gray-700 overflow-hidden">
        <div className="p-6 sm:p-8">
          <header className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              AI Text-to-Speech
            </h1>
            <p className="text-gray-400 mt-2">Upload text or docx files, choose a voice, and listen.</p>
          </header>

          <main className="space-y-6">
            <FileUpload 
              onFilesSelected={handleFilesSelected}
              selectedFiles={files}
              clearFiles={clearFiles}
            />

            <VoiceSelector
              voices={AVAILABLE_VOICES}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              onPreviewVoice={handlePreviewVoice}
              isPreviewing={isPreviewing}
            />
            
            <PitchSlider
              pitch={pitch}
              onPitchChange={setPitch}
            />

            <div className="pt-2">
              <button
                onClick={handleGenerateAudio}
                disabled={!canGenerate}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner className="w-5 h-5 animate-spin" />
                    <span>{statusMessage || 'Processing...'}</span>
                  </>
                ) : (
                  'Generate Audio'
                )}
              </button>
            </div>
          </main>
        </div>
        
        {(errorMessage || audioUrl) && (
          <footer className="bg-black/20 px-6 sm:px-8 py-4">
            {errorMessage && (
              <div className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">
                <p>Error: {errorMessage}</p>
              </div>
            )}
            {audioUrl && !errorMessage && <AudioPlayer audioUrl={audioUrl} />}
          </footer>
        )}
      </div>
    </div>
  );
};

export default App;
