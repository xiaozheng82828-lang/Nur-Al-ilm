import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageType, SUPPORTED_LANGUAGES } from '../types';
import { Bot, User, AlertTriangle, Languages, ChevronDown, Loader2, Volume2, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
  onTranslate?: (messageId: string, language: string) => void;
  onPlayAudio?: (messageId: string, text: string) => Promise<void>;
  isTranslating?: boolean;
  isGeneratingAudio?: boolean;
}

// Helper to decode base64 to array buffer
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onTranslate, onPlayAudio, isTranslating, isGeneratingAudio }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const isBot = message.type === MessageType.BOT;
  const isError = message.type === MessageType.ERROR;
  const isSystem = message.type === MessageType.SYSTEM;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Determine content to display based on selected language
  const displayContent = (message.displayLanguage && message.displayLanguage !== 'Original' && message.translations?.[message.displayLanguage])
    ? message.translations[message.displayLanguage]
    : message.content;

  const currentLangLabel = message.displayLanguage || 'Original';

  const handleAudioAction = async () => {
    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    let audioData = message.audioData;
    if (!audioData && onPlayAudio) {
       const data = await onPlayAudio(message.id, displayContent);
       // @ts-ignore
       if (data && typeof data === 'string') audioData = data;
    }

    if (audioData) {
      playAudioData(audioData);
    }
  };

  const playAudioData = async (base64: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const arrayBuffer = decodeBase64(base64);
      const audioBuffer = await customDecodeAudioData(arrayBuffer, audioContextRef.current!, 24000, 1);
      
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current!.destination);
      source.onended = () => setIsPlaying(false);
      sourceNodeRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio playback error", e);
      setIsPlaying(false);
    }
  };

  // Helper from the system instructions
  async function customDecodeAudioData(
    arrayBuffer: ArrayBuffer,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    // The data is raw PCM 16-bit integers (Little Endian)
    const dataView = new DataView(arrayBuffer);
    const frameCount = arrayBuffer.byteLength / 2 / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        // Convert Int16 to Float32 [-1.0, 1.0]
        const sample = dataView.getInt16(i * 2 * numChannels + channel * 2, true);
        channelData[i] = sample / 32768.0;
      }
    }
    return buffer;
  }

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="bg-amber-100 text-amber-900 text-xs px-3 py-1 rounded-full flex items-center gap-1 border border-amber-200">
          <AlertTriangle size={12} />
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full ${isBot || isError ? 'justify-start' : 'justify-end'} mb-6 animate-fade-in group`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isBot || isError ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2
          ${isBot ? 'bg-emerald-800 border-amber-400' : isError ? 'bg-red-500 border-red-300' : 'bg-slate-100 border-slate-300'}`}>
          {isBot ? <Bot className="text-amber-100 w-6 h-6" /> : 
           isError ? <AlertTriangle className="text-white w-5 h-5" /> :
           <User className="text-slate-600 w-6 h-6" />}
        </div>

        {/* Bubble Container */}
        <div className={`flex flex-col ${isBot || isError ? 'items-start' : 'items-end'}`}>
          
          {/* Message Bubble */}
          <div className={`relative px-5 py-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-md
            ${isBot 
              ? 'bg-white border border-emerald-100 text-slate-800 rounded-tl-none' 
              : isError
                ? 'bg-red-50 border border-red-100 text-red-800 rounded-tl-none'
                : 'bg-emerald-700 text-white rounded-tr-none'
            }`}>
             
             {/* Content */}
             <div className={isBot ? "prose prose-sm prose-emerald max-w-none" : ""}>
                {isBot ? <ReactMarkdown>{displayContent}</ReactMarkdown> : displayContent}
             </div>

             {/* Disclaimer for Bot Messages */}
             {isBot && (
               <div className="mt-3 pt-2 border-t border-emerald-50 text-[10px] text-emerald-600/70 italic">
                 Note: AI can also make mistakes, so ask the scholars around you whether it is correct or not.
               </div>
             )}

             {/* Bot Tools Footer */}
             {isBot && onTranslate && (
                <div className="mt-2 pt-2 border-t border-emerald-50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Language Menu */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors font-medium"
                      >
                        <Languages size={14} />
                        <span>{currentLangLabel}</span>
                        <ChevronDown size={12} />
                      </button>
                      
                      {/* Language Dropdown */}
                      {showLangMenu && (
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 max-h-60 overflow-y-auto">
                          <button
                            onClick={() => {
                              onTranslate(message.id, 'Original');
                              setShowLangMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 ${currentLangLabel === 'Original' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-gray-700'}`}
                          >
                            Original
                          </button>
                          {SUPPORTED_LANGUAGES.map(lang => (
                            <button
                              key={lang}
                              onClick={() => {
                                onTranslate(message.id, lang);
                                setShowLangMenu(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 ${currentLangLabel === lang ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-gray-700'}`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Play Audio Button */}
                    <button
                      onClick={handleAudioAction}
                      disabled={isGeneratingAudio}
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors font-medium
                        ${isPlaying ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'}
                        ${isGeneratingAudio ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {isGeneratingAudio ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : isPlaying ? (
                        <StopCircle size={14} />
                      ) : (
                        <Volume2 size={14} />
                      )}
                      <span>{isPlaying ? 'Stop' : 'Listen'}</span>
                    </button>
                  </div>
                  
                  {isTranslating && message.displayLanguage === 'loading' && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Loader2 size={12} className="animate-spin" />
                      <span>Translating...</span>
                    </div>
                  )}
                </div>
             )}
          </div>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
             <div className="mt-2 ml-1 text-xs flex flex-wrap gap-2 max-w-full">
               {message.sources.map((source, idx) => (
                 <a 
                   key={idx} 
                   href={source.uri} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-emerald-200/50 px-2 py-1 rounded-md text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-sm"
                 >
                   <span className="truncate max-w-[150px]">{source.title}</span>
                 </a>
               ))}
             </div>
          )}
          
          <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      
      {/* Background Overlay for Dropdown */}
      {showLangMenu && (
        <div 
          className="fixed inset-0 z-10 bg-transparent"
          onClick={() => setShowLangMenu(false)}
        />
      )}
    </div>
  );
};
