import React from 'react';
import { X, MessageSquare, Calendar, Newspaper, Trash2 } from 'lucide-react';
import { AppView } from '../types';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onClearHistory: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, currentView, onChangeView, onClearHistory }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-[#FFFBF2] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-amber-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-5 flex items-center justify-between border-b border-amber-100 bg-emerald-900 text-white">
            <h2 className="text-lg font-bold font-arabic">Menu</h2>
            <button onClick={onClose} className="p-1 hover:bg-emerald-800 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4 space-y-2">
            <button
              onClick={() => { onChangeView('chat'); onClose(); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentView === 'chat' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'hover:bg-gray-100 text-slate-700'}`}
            >
              <MessageSquare size={20} />
              <span>Chat & History</span>
            </button>

            <button
              onClick={() => { onChangeView('calendar'); onClose(); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentView === 'calendar' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'hover:bg-gray-100 text-slate-700'}`}
            >
              <Calendar size={20} />
              <span>Islamic Calendar</span>
            </button>

            <button
              onClick={() => { onChangeView('news'); onClose(); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentView === 'news' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'hover:bg-gray-100 text-slate-700'}`}
            >
              <Newspaper size={20} />
              <span>Islamic News</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-amber-100">
             <button
               onClick={() => {
                 if (window.confirm("Are you sure you want to clear the entire chat history?")) {
                   onClearHistory();
                   onClose();
                 }
               }}
               className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-100"
             >
               <Trash2 size={20} />
               <span>Clear Chat History</span>
             </button>
          </div>
        </div>
      </div>
    </>
  );
};
