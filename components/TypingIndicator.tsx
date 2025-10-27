
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 my-4 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          MM
      </div>
      <div className="bg-gray-700 text-gray-200 rounded-2xl rounded-bl-none p-3 flex items-center space-x-1.5">
          <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="block w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
