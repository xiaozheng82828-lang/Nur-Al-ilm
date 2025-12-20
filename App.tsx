import React, { useState, useEffect, useRef } from 'react';
import { Send, Moon, Star, RefreshCw, ShieldAlert, BookOpen, Sparkles, Mic, MicOff, MoreVertical } from 'lucide-react';
import { checkContentSafety, generateIslamicAnswer, translateContent, generateSpeech } from './services/geminiService';
import { Message, MessageType, UserStatus, SafetyStatus, AppView } from './types';
import { SuspendedScreen } from './components/SuspendedScreen';
import { ChatMessage } from './components/ChatMessage';
import { Drawer } from './components/Drawer';
import { IslamicCalendar } from './components/IslamicCalendar';
import { IslamicNews } from './components/IslamicNews';

// Constants
const SUSPENSION_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours
const STORAGE_KEY_SUSPENSION = 'nur_al_ilm_suspension';
const STORAGE_KEY_HISTORY = 'nur_al_ilm_chat_history';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [translatingMsgId, setTranslatingMsgId] = useState<string | null>(null);
  const [generatingAudioMsgId, setGeneratingAudioMsgId] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>(UserStatus.ACTIVE);
  const [suspensionEndTime, setSuspensionEndTime] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  // Navigation State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load suspension state on mount
  useEffect(() => {
    const storedSuspension = localStorage.getItem(STORAGE_KEY_SUSPENSION);
    if (storedSuspension) {
      const endTime = parseInt(storedSuspension, 10);
      if (Date.now() < endTime) {
        setUserStatus(UserStatus.SUSPENDED);
        setSuspensionEndTime(endTime);
      } else {
        localStorage.removeItem(STORAGE_KEY_SUSPENSION);
      }
    }
    
    // Load History
    const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (storedHistory) {
        try {
            setMessages(JSON.parse(storedHistory));
        } catch(e) { console.error("Failed to load history", e); }
    } else {
        // Initial welcome message
        setMessages([{
            id: 'welcome',
            type: MessageType.BOT,
            content: "As-salamu alaykum (Peace be upon you). I am Nur Al-Ilm, your multilingual Islamic assistant. I can speak your language. You may ask me about Duas, Prayer methods, Islamic history, or daily guidance.",
            timestamp: Date.now(),
            displayLanguage: 'Original'
        }]);
    }
  }, []);

  // Save history on change
  useEffect(() => {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(messages));
      }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (currentView === 'chat') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, translatingMsgId, currentView]);

  // Timer for suspension countdown
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (userStatus === UserStatus.SUSPENDED && suspensionEndTime) {
      const interval = setInterval(() => {
        const remaining = suspensionEndTime - Date.now();
        if (remaining <= 0) {
          setUserStatus(UserStatus.ACTIVE);
          setSuspensionEndTime(null);
          localStorage.removeItem(STORAGE_KEY_SUSPENSION);
          clearInterval(interval);
        } else {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [userStatus, suspensionEndTime]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || isLoading || userStatus === UserStatus.SUSPENDED || userStatus === UserStatus.WARNED) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: MessageType.USER,
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Safety Check
      const safetyCheck = await checkContentSafety(userMsg.content);

      if (safetyCheck.status === SafetyStatus.TAMPERING) {
        const endTime = Date.now() + SUSPENSION_DURATION_MS;
        localStorage.setItem(STORAGE_KEY_SUSPENSION, endTime.toString());
        setSuspensionEndTime(endTime);
        setUserStatus(UserStatus.SUSPENDED);
        setIsLoading(false);
        return;
      }

      if (safetyCheck.status === SafetyStatus.UNSAFE) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: MessageType.ERROR,
          content: "⚠️ **WARNING:** Your message contains inappropriate content. Please maintain respect.",
          timestamp: Date.now()
        }]);
        setUserStatus(UserStatus.WARNED);
        setIsLoading(false);
        return;
      }

      // 2. Generate Answer
      const answer = await generateIslamicAnswer(userMsg.content);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: MessageType.BOT,
        content: answer.text,
        sources: answer.sources,
        timestamp: Date.now(),
        displayLanguage: 'Original',
        translations: {}
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: MessageType.ERROR,
        content: "I encountered a temporary issue connecting to the service. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (messageId: string, targetLang: string) => {
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    const msg = messages[msgIndex];

    if (targetLang === 'Original') {
      const updated = [...messages];
      updated[msgIndex] = { ...msg, displayLanguage: 'Original' };
      setMessages(updated);
      return;
    }

    if (msg.translations && msg.translations[targetLang]) {
      const updated = [...messages];
      updated[msgIndex] = { ...msg, displayLanguage: targetLang };
      setMessages(updated);
      return;
    }

    setTranslatingMsgId(messageId);
    try {
      const translatedText = await translateContent(msg.content, targetLang);
      
      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === messageId);
        if (idx === -1) return prev;
        
        const updatedMsg = { 
          ...prev[idx], 
          displayLanguage: targetLang,
          translations: {
            ...prev[idx].translations,
            [targetLang]: translatedText
          }
        };
        
        const newMessages = [...prev];
        newMessages[idx] = updatedMsg;
        return newMessages;
      });

    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setTranslatingMsgId(null);
    }
  };

  const handlePlayAudio = async (messageId: string, text: string): Promise<any> => {
    setGeneratingAudioMsgId(messageId);
    try {
       const audioBase64 = await generateSpeech(text);
       if (audioBase64) {
         setMessages(prev => {
            const idx = prev.findIndex(m => m.id === messageId);
            if (idx === -1) return prev;
            
            const updatedMsg = {
               ...prev[idx],
               audioData: audioBase64
            };
            const newMessages = [...prev];
            newMessages[idx] = updatedMsg;
            return newMessages;
         });
         return audioBase64;
       }
    } catch (e) {
      console.error("Failed to generate audio", e);
    } finally {
      setGeneratingAudioMsgId(null);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; 

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleRefresh = () => {
    if (userStatus === UserStatus.WARNED) {
       setUserStatus(UserStatus.ACTIVE);
       setMessages([{
         id: 'reset-welcome',
         type: MessageType.BOT,
         content: "As-salamu alaykum. Let us start a fresh, respectful conversation.",
         timestamp: Date.now(),
         displayLanguage: 'Original'
       }]);
    }
  };

  const clearHistory = () => {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      setMessages([{
        id: 'welcome-new',
        type: MessageType.BOT,
        content: "As-salamu alaykum. Chat history cleared.",
        timestamp: Date.now(),
        displayLanguage: 'Original'
      }]);
      setCurrentView('chat');
  };

  if (userStatus === UserStatus.SUSPENDED) {
    return <SuspendedScreen remainingTime={timeLeft} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#FFFBF2] font-sans text-slate-800 relative">
      
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23064e3b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Header */}
      <header className="bg-emerald-900 text-white shadow-lg z-10 border-b-4 border-amber-500">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentView('chat')}>
            <div className="bg-emerald-800 p-2.5 rounded-xl border border-emerald-600 shadow-inner">
              <Moon className="w-7 h-7 text-amber-400 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-arabic tracking-wide text-amber-50">Nur Al-Ilm</h1>
              <p className="text-xs text-emerald-200 uppercase tracking-widest font-medium">Islamic Knowledge AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-6 text-emerald-100 text-sm">
                <div className="flex items-center gap-2 bg-emerald-800/50 px-3 py-1.5 rounded-lg border border-emerald-700/50">
                <Sparkles size={14} className="text-amber-400" />
                <span className="font-arabic">Authentic Sources</span>
                </div>
             </div>
             
             {/* Drawer Toggle */}
             <button 
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 hover:bg-emerald-800 rounded-lg transition-colors"
             >
                <MoreVertical size={24} className="text-emerald-100" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto z-10 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
        <div className="max-w-3xl mx-auto h-full">
           
           {currentView === 'chat' && (
             <div className="px-4 py-6">
                <div className="min-h-[50vh]">
                    {messages.map((msg) => (
                    <ChatMessage 
                        key={msg.id} 
                        message={msg} 
                        onTranslate={handleTranslate}
                        onPlayAudio={handlePlayAudio}
                        isTranslating={translatingMsgId === msg.id}
                        isGeneratingAudio={generatingAudioMsgId === msg.id}
                    />
                    ))}
                    
                    {isLoading && (
                    <div className="flex items-center gap-3 text-emerald-700/60 text-sm ml-4 mt-4 bg-white/50 w-fit px-4 py-2 rounded-full border border-emerald-100/50">
                        <div className="flex gap-1">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="font-arabic">Searching knowledge...</span>
                    </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
             </div>
           )}

           {currentView === 'calendar' && (
             <IslamicCalendar />
           )}

           {currentView === 'news' && (
             <IslamicNews />
           )}

        </div>
      </main>

      {/* Input Area (Only visible in Chat View) */}
      {currentView === 'chat' && (
        <footer className="bg-white border-t border-amber-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            <div className="max-w-3xl mx-auto">
            {userStatus === UserStatus.WARNED ? (
                <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
                    <div className="flex items-center gap-2 text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                    <ShieldAlert />
                    <span>Chat Paused</span>
                    </div>
                    <p className="text-sm text-gray-600">Please adhere to respectful Islamic guidelines.</p>
                    <button 
                    onClick={handleRefresh}
                    className="flex items-center gap-2 bg-emerald-700 text-white px-6 py-2.5 rounded-full hover:bg-emerald-800 transition-colors shadow-lg hover:shadow-xl"
                    >
                    <RefreshCw size={16} />
                    Start New Conversation
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-3 rounded-xl transition-all ${
                    isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Ask about Prayer, Dua, or Islamic History..."}
                    className="w-full pl-6 pr-14 py-4 bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all shadow-inner placeholder:text-gray-400"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={`absolute right-2 p-2.5 rounded-xl transition-all duration-300 ${
                    input.trim() && !isLoading 
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-md transform hover:scale-105' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <Send size={20} />
                </button>
                </form>
            )}
            <div className="text-center mt-3">
                <p className="text-[10px] text-gray-400 font-medium tracking-wide">
                AI GENERATED • CONSULT SCHOLARS FOR FIQH RULINGS
                </p>
            </div>
            </div>
        </footer>
      )}
      
      {/* Drawer Component */}
      <Drawer 
         isOpen={isDrawerOpen} 
         onClose={() => setIsDrawerOpen(false)} 
         currentView={currentView}
         onChangeView={setCurrentView}
         onClearHistory={clearHistory}
      />
    </div>
  );
};

export default App;
