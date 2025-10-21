import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message, MessageRole, Source, UserData } from './types';
import Header from './components/Header';
import ChatLog from './components/ChatLog';
import InputBar from './components/InputBar';
import UserInfoForm from './components/UserInfoForm';

const BASE_SYSTEM_PROMPT = `You are GRIN, a sharp, confident, and helpful AI trading assistant specializing in the Indian Stock Market (NSE/BSE). You have a unique personality: you communicate in a mix of English and Tamil (Tanglish) for conversational parts, making you relatable and friendly. For example, you can use phrases like "Vanakkam," "Nalla irukku," or "Romba thanks." However, for all financial data, stock analysis, and critical trading information, you MUST switch to clear, professional English to ensure accuracy and avoid confusion. You have access to real-time data via Google Search to provide up-to-date analysis. Your tone should be trader-friendly. For any stock analysis or market query, provide actionable insights and always include the following in a clear English format:
- A clear, concise headline.
- Reasoning (technical/fundamental analysis points in bullets).
- Confidence score (0-100%).
- Time horizon (Intraday/Swing/Long-term).
- Risk suggestion (e.g., suggested stop-loss percentage or price level).
Give data in a concise, trader-friendly tone. Do not include the disclaimer in your response.`;

const DISCLAIMER = "⚠️ This is market analysis, not financial advice.";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(BASE_SYSTEM_PROMPT);

  const handleSessionStart = (data: UserData) => {
    const personalizedPrompt = `${BASE_SYSTEM_PROMPT}
    
    The user's details are:
    - Name: ${data.name}
    - Age: ${data.age}
    - Investor Status: ${data.isInvestor ? 'Active Investor' : 'Learner'}
    
    Tailor your language and complexity to suit them. Be encouraging if they are a learner.`;
    setSystemPrompt(personalizedPrompt);
    setSessionStarted(true);
  };
  
  useEffect(() => {
    if (!sessionStarted) return; // Don't initialize until user info is submitted

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleSearch: {} }],
        },
      });
      setChat(chatSession);
    } catch (error) {
      console.error("Failed to initialize Gemini AI:", error);
      setMessages([{ role: MessageRole.MODEL, text: "Error: Could not initialize AI. Please check your API key." }]);
    }
  }, [sessionStarted, systemPrompt]);

  const handleSendMessage = useCallback(async (userInput: string, image?: { mimeType: string; data: string; }) => {
    if (!chat || isLoading) return;

    setIsLoading(true);
    
    const userMessage: Message = { 
        role: MessageRole.USER, 
        text: userInput,
        image: image ? `data:${image.mimeType};base64,${image.data}` : undefined,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      const messageParts: (string | object)[] = [userInput];
      if (image) {
          messageParts.push({
              inlineData: {
                  mimeType: image.mimeType,
                  data: image.data,
              }
          });
      }

      const stream = await chat.sendMessageStream({ message: messageParts });
      
      let fullText = "";
      let groundingSources: Source[] = [];
      let modelMessage: Message = { role: MessageRole.MODEL, text: "" };

      setMessages(prev => [...prev, modelMessage]);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullText += chunkText;
        
        const metadata = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (metadata) {
            groundingSources = metadata
                .map((chunkItem: any) => chunkItem.web)
                .filter(Boolean)
                .map((webSource: any) => ({ uri: webSource.uri, title: webSource.title }));
        }

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText;
          return newMessages;
        });
      }

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessage.text = `${fullText.trim()}\n\n${DISCLAIMER}`;
        if (groundingSources.length > 0) {
            lastMessage.sources = groundingSources;
        }
        return newMessages;
      });

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
       setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1].role === MessageRole.MODEL && newMessages[newMessages.length - 1].text === "") {
             newMessages[newMessages.length - 1].text = errorMessage;
        } else {
             newMessages.push({ role: MessageRole.MODEL, text: errorMessage });
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }, [chat, isLoading]);

  return (
    <div 
      className="flex flex-col h-screen bg-cover bg-center bg-fixed text-slate-200"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop')" }}
    >
      {!sessionStarted && <UserInfoForm onSessionStart={handleSessionStart} />}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative z-10 flex flex-col h-full">
        <Header />
        <ChatLog messages={messages} isLoading={isLoading} />
        <InputBar onSendMessage={handleSendMessage} isLoading={isLoading || !sessionStarted} />
      </div>
    </div>
  );
};

export default App;