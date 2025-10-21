import React from 'react';
import { Message, MessageRole } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;

  const wrapperClasses = `flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubbleClasses = `max-w-md lg:max-w-2xl px-5 py-3 rounded-xl text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
    isUser
      ? 'bg-orange-900/30 border border-orange-500/50 shadow-[0_0_15px_rgba(255,122,24,0.3)]'
      : 'bg-cyan-900/30 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,245,255,0.3)]'
  }`;
  
  const roleLabelClasses = `text-xs font-bold mb-1 ${isUser ? 'text-orange-400 text-right' : 'text-cyan-400'}`;

  return (
    <div className={wrapperClasses}>
      <div className="w-full max-w-md lg:max-w-2xl">
        <p className={roleLabelClasses}>{isUser ? 'YOU' : 'GRIN AI'}</p>
        <div className={bubbleClasses}>
          {message.image && (
            <img 
              src={message.image} 
              alt="User attachment" 
              className="rounded-lg mb-3 max-w-full h-auto max-h-64" 
            />
          )}
          {message.text}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-cyan-400/20">
              <h4 className="text-xs text-cyan-300/80 font-semibold mb-2">SOURCES:</h4>
              <ul className="space-y-1">
                {message.sources.map((source, index) => (
                  <li key={index} className="text-xs truncate">
                    <a
                      href={source.uri}
                      target="_blank"
      
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-200 hover:underline transition-colors duration-200"
                      title={source.title}
                    >
                      {`[${index + 1}] ${source.title}`}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
