
import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
        VOUS
    </div>
);

const AiIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
        MM
    </div>
);


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <AiIcon />}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-700 text-gray-200 rounded-bl-none'
        }`}
      >
        <p className="text-sm break-words">{message.text}</p>
      </div>
       {isUser && <UserIcon />}
    </div>
  );
};

export default ChatMessage;
