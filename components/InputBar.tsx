// Fix: Add TypeScript definitions for the experimental Web Speech API to resolve type errors.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, MicIcon, UploadIcon, XCircleIcon } from './Icons';

interface InputBarProps {
  onSendMessage: (message: string, image?: { mimeType: string; data: string; }) => void;
  isLoading: boolean;
}

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });


const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; data: string; preview: string; } | null>(null);

  const speechRecognition = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognition.current = recognition;
    } else {
      console.warn("Speech Recognition not supported in this browser.");
    }
  }, []);

  const handleMicClick = () => {
    if (!speechRecognition.current) return;

    if (isListening) {
      speechRecognition.current.stop();
    } else {
      speechRecognition.current.start();
      setIsListening(true);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        try {
            const dataUrl = await fileToBase64(file);
            const base64Data = dataUrl.split(',')[1];
            setAttachedFile({
                name: file.name,
                type: file.type,
                data: base64Data,
                preview: dataUrl,
            });
        } catch (error) {
            console.error("Error reading file:", error);
        }
    }
    if (event.target) {
        event.target.value = '';
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachedFile) && !isLoading) {
      onSendMessage(
        input.trim(),
        attachedFile ? { mimeType: attachedFile.type, data: attachedFile.data } : undefined
      );
      setInput('');
      setAttachedFile(null);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/50 backdrop-blur-md border-t border-cyan-400/20 z-10">
      <div className="container mx-auto p-4">
        {attachedFile && (
            <div className="mb-2 flex items-center bg-slate-800/60 p-2 rounded-lg border border-cyan-400/30">
                <img src={attachedFile.preview} alt="Preview" className="w-10 h-10 object-cover rounded-md mr-3" />
                <span className="text-sm text-slate-300 truncate flex-grow">{attachedFile.name}</span>
                <button
                    onClick={() => setAttachedFile(null)}
                    className="text-slate-400 hover:text-red-400 transition-colors p-1"
                    title="Remove attachment"
                >
                    <XCircleIcon className="w-6 h-6" />
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="flex-grow relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Initiate Query..."}
              disabled={isLoading}
              className="w-full bg-slate-800/60 border border-cyan-400/30 rounded-lg py-3 pl-4 pr-24 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition duration-300 disabled:opacity-50"
            />
             <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                 <button type="button" onClick={handleMicClick} className={`${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400'} hover:text-cyan-300 transition-colors`} title="Voice Input">
                    <MicIcon className="w-5 h-5" />
                 </button>
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-cyan-300 transition-colors" title="Attach Image">
                    <UploadIcon className="w-5 h-5" />
                 </button>
             </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !attachedFile)}
            className="bg-cyan-500 text-slate-900 font-bold rounded-lg px-4 py-3 flex items-center justify-center transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,245,255,0.6)] disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </footer>
  );
};

export default InputBar;