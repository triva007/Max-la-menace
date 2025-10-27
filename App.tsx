
import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { getChatSession } from './services/geminiService';
import type { Message } from './types';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getOrCreateChat = (): Chat | null => {
    if (chat) {
        return chat;
    }
    if (apiKeyError) {
        return null;
    }

    try {
        const chatSession = getChatSession();
        setChat(chatSession);
        return chatSession;
    } catch (error) {
        console.error("Failed to initialize chat session:", error);
        setApiKeyError(true);
        setMessages([{
            id: 'error-1',
            text: "La clé d'API est manquante. L'application ne peut pas démarrer.",
            sender: 'ai'
        }]);
        return null;
    }
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const chatSession = getOrCreateChat();
    if (!chatSession) {
        return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMessage.text });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "J'ai la flemme de répondre là essaie plus tard.",
        sender: 'ai',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Header />
      <main className="flex-grow overflow-y-auto p-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </main>
      <ChatInput
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        isLoading={isLoading || apiKeyError}
      />
    </div>
  );
};

export default App;
