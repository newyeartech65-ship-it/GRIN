
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

interface ChatLogProps {
  messages: Message[];
  isLoading: boolean;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex justify-start mb-4">
        <div>
            <p className="text-xs font-bold mb-1 text-cyan-400">GRIN AI</p>
            <div className="max-w-md px-5 py-3 rounded-xl text-slate-200 bg-cyan-900/30 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,245,255,0.3)]">
                <div className="flex items-center justify-center space-x-1">
                    <span className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></span>
                </div>
            </div>
        </div>
    </div>
);


const ChatLog: React.FC<ChatLogProps> = ({ messages, isLoading }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <main className="flex-grow container mx-auto px-4 py-8 overflow-y-auto">
      <div className="pt-20 pb-24">
        <h2 className="text-center text-slate-500 text-sm mb-6 border-b border-slate-700/50 pb-2">DATA LOG: SESSION INITIATED</h2>
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={chatEndRef} />
      </div>
    </main>
  );
};

export default ChatLog;
