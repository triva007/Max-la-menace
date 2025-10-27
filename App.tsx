
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
  const [isKeySelected, setIsKeySelected] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        if (await window.aistudio.hasSelectedApiKey()) {
          setIsKeySelected(true);
        }
      } catch (e) {
        console.error('Error checking for API key', e);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    if (isKeySelected && !chat) {
      try {
        const chatSession = getChatSession();
        setChat(chatSession);
        setApiKeyError(false); // Clear previous errors
        setMessages([]); // Clear any error messages
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
        setApiKeyError(true);
        setMessages([{
            id: 'error-1',
            text: "La clé d'API est manquante ou invalide. L'application ne peut pas démarrer.",
            sender: 'ai'
        }]);
      }
    }
  }, [isKeySelected, chat]);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      setIsKeySelected(true);
    } catch (e) {
      console.error('Could not open API key selection', e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || !chat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: userMessage.text });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
       if (error instanceof Error && error.message.includes('Requested entity was not found')) {
        setIsKeySelected(false); // Reset and prompt for key again
        return;
      }
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

  if (isCheckingKey) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <p>Vérification de la configuration...</p>
        </div>
    );
  }

  if (!isKeySelected) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Clé d'API requise</h1>
              <p className="mb-6 max-w-sm">Pour discuter avec Maximilien, veuillez sélectionner une clé d'API Gemini. Assurez-vous que la clé est activée pour le bon projet.</p>
              <button
                  onClick={handleSelectKey}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
              >
                  Sélectionner la clé d'API
              </button>
          </div>
      );
  }

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
        isLoading={isLoading || apiKeyError || !chat}
      />
    </div>
  );
};

export default App;
