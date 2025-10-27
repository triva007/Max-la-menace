import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Chat } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './services/geminiService';
import type { Message } from './types';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';

const App: React.FC = () => {
  const chatRef = useRef<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Initialisation paresseuse lors du premier message
      if (!chatRef.current) {
        // La clé API DOIT être définie dans les variables d'environnement (ex: sur Vercel)
        if (!process.env.API_KEY) {
          console.error("La clé d'API est manquante.");
          setMessages([
            {
              id: 'initial-error',
              text: "La clé d'API est manquante. L'application ne peut pas démarrer.",
              sender: 'ai',
            },
          ]);
          return; // Le bloc finally s'exécutera
        }
        
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
            },
          });
        } catch (error) {
          console.error("Échec de l'initialisation du chat:", error);
          setMessages([
            {
              id: 'init-fail-error',
              text: "J'arrive pas à me connecter là y'a un bug. Réessaie plus tard.",
              sender: 'ai',
            },
          ]);
          return; // Le bloc finally s'exécutera
        }
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: 'user',
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setInput('');

      const response = await chatRef.current!.sendMessage({ message: userMessage.text });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        // N'ajoutez un message d'erreur que si ce n'est pas une erreur d'initialisation
        if (chatRef.current) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "J'ai la flemme de répondre là essaie plus tard.",
                sender: 'ai',
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
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
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;
