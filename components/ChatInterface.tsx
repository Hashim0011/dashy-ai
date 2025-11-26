
import React, { useState, useRef, useEffect } from 'react';
import { Theme, SaaSMetrics, ChatMessage, AppSettings } from '../types';
import { Send, Bot, User, Sparkles, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { sendChatMessageToN8N } from '../services/n8nService';

interface ChatInterfaceProps {
  metrics: SaaSMetrics;
  theme: Theme;
  settings: AppSettings;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ metrics, theme, settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AI Data Analyst. I have access to your latest dashboard metrics. Ask me about trends, performance, or strategic recommendations based on your data.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Delegate to the Service Layer which handles the actual Webhook connection
      const responseText = await sendChatMessageToN8N(userMsg.content, messages, metrics, settings);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error(error);
      let errorText = "⚠️ Connection Error: Could not reach the AI endpoint.";
      
      if (error.message?.includes('500')) {
         errorText = "⚠️ **Server Error (500)**\n\nThe n8n workflow crashed. We tried sending a simplified request but it also failed.\n\n**Fix:** Check your n8n 'Executions' tab. The AI model might be rejecting the request or the workflow has a broken node.";
      } else if (error.message?.includes('404')) {
         errorText = "⚠️ **Not Found (404)**\n\nThe Webhook URL is incorrect or the workflow is not active.\n\n**Fix:** Check the URL in Settings and ensure the workflow is 'Active'.";
      }

      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const isTestMode = settings.chatWebhookUrl?.includes('webhook-test');

  return (
    <div className="animate-fade-in-up h-[calc(100vh-140px)] flex flex-col rounded-3xl border glass-panel overflow-hidden shadow-2xl"
         style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
      
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: theme.borderColor }}>
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: theme.accentGradient }}>
              <Bot className="text-white" size={24} />
           </div>
           <div>
              <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>AI Analyst Insights</h2>
              <div className="flex items-center gap-2 text-xs opacity-60 mt-1">
                 <span className={`w-2 h-2 rounded-full ${settings.chatWebhookUrl ? (isTestMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse') : 'bg-red-500'}`}></span>
                 <span>{settings.chatWebhookUrl ? (isTestMode ? 'Test Mode Active' : 'Online & Connected to Data') : 'Webhook Missing'}</span>
              </div>
           </div>
        </div>
        
        {/* Test Mode Warning Banner */}
        {isTestMode && (
           <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-pulse">
              <AlertTriangle size={16} className="text-amber-500" />
              <p className="text-xs font-medium text-amber-500">
                 Test Mode: Click 'Execute Workflow' in n8n
              </p>
           </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-white/10' : ''}`}
                 style={{ 
                   background: msg.role === 'assistant' ? theme.accentGradient : undefined,
                   borderColor: theme.borderColor
                 }}>
               {msg.role === 'user' ? <User size={18} style={{ color: theme.textPrimary }} /> : <Sparkles size={18} className="text-white" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] p-5 rounded-2xl border shadow-sm relative group ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`}
                 style={{ 
                   backgroundColor: msg.role === 'user' ? theme.cardBg : (theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                   borderColor: theme.borderColor,
                   color: theme.textPrimary
                 }}>
               <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.content}
               </div>
               <div className="mt-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-50 transition-opacity">
                  <span className="text-[10px]">{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
               </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
           <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg" style={{ background: theme.accentGradient }}>
                 <RefreshCw size={18} className="text-white animate-spin" />
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border" style={{ borderColor: theme.borderColor, backgroundColor: theme.cardBg }}>
                 <div className="flex gap-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ color: theme.textSecondary }}></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ color: theme.textSecondary, animationDelay: '0.1s' }}></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ color: theme.textSecondary, animationDelay: '0.2s' }}></div>
                 </div>
                 <span className="text-xs font-medium animate-pulse" style={{ color: theme.textSecondary }}>AI is thinking... this may take a minute</span>
              </div>
              
              {isTestMode && (
                 <div className="flex items-center h-10">
                    <span className="text-xs text-amber-500 animate-pulse font-medium">Waiting for n8n (Click Execute)...</span>
                 </div>
              )}
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t" style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}>
        <div className="relative flex items-center gap-3">
           <input
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             placeholder={settings.chatWebhookUrl ? (isTestMode ? "Test Mode: Ensure n8n is listening..." : "Ask about your data (e.g., 'Why did revenue drop in March?')...") : "Please configure Chat Webhook in Settings first"}
             disabled={isLoading || !settings.chatWebhookUrl}
             className="w-full px-6 py-4 rounded-2xl outline-none border focus:ring-2 transition-all shadow-inner text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
             style={{ 
               backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : '#f9fafb',
               borderColor: theme.borderColor,
               color: theme.textPrimary,
               boxShadow: theme.shadow
             }}
           />
           <button
             onClick={handleSend}
             disabled={isLoading || !input.trim() || !settings.chatWebhookUrl}
             className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 text-white shadow-lg"
             style={{ background: theme.accentGradient }}
           >
             <Send size={18} className={document.documentElement.dir === 'rtl' ? 'rotate-180' : ''} />
           </button>
        </div>
        <div className="mt-3 flex justify-center gap-4 text-[10px] opacity-40 font-medium tracking-widest uppercase" style={{ color: theme.textSecondary }}>
           <span>AI Powered Analysis</span>
           <span>•</span>
           <span>{settings.chatWebhookUrl ? 'Connected to N8N' : 'Disconnected'}</span>
        </div>
      </div>
    </div>
  );
};
