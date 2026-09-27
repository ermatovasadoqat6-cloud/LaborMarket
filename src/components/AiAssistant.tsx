import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Sparkles, Send, X, Minimize2, Maximize2, Trash2, Copy, Check, MessageSquare, ChevronDown } from 'lucide-react';
import { ChatMessage, UserRole } from '../types';

interface AiAssistantProps {
  userRole: UserRole;
  darkMode: boolean;
  userName?: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ userRole, darkMode, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Assalomu alaykum${userName ? `, ${userName}` : ''}! Men **LaborMarket AI** maslahatchisiman. 🚀\n\nSizga qanday yordam bera olaman?\n- **Rezyume (CV)** tahlili va uni kuchaytirish\n- **Suhbat (Interview)** savollariga tayyorgarlik\n- **Vakansiya** yoki **Motivatsion xat** yozish\n- Bozor tendensiyalari va maoshlar tahlili`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeRoleMode, setActiveRoleMode] = useState<UserRole>(userRole);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveRoleMode(userRole);
  }, [userRole]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = activeRoleMode === 'employer'
    ? [
        "Jozibador vakansiya matnini tuzib ber",
        "Senior dasturchi uchun suhbat savollari",
        "Xodimlarni saralash mezonlari qanday?",
        "Nomzodga rad javobini xushmuomala yozish",
      ]
    : [
        "Rezyumemni qanday yaxshilasam bo'ladi?",
        "Frontend dasturchi suhbatida nimalar so'raladi?",
        "Motivatsion xat (Cover Letter) yozib ber",
        "O'zbekistonda IT sohasida qanday maoshlar to'lanadi?",
      ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role === 'model' ? 'model' : 'user',
            content: m.content,
          })),
          role: activeRoleMode,
        }),
      });

      const data = await response.json();
      const botReply: ChatMessage = {
        id: 'reply-' + Date.now(),
        role: 'model',
        content: data.reply || "Kechirasiz, javob olishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'model',
          content: "Server bilan aloqa uzildi. Iltimos, qayta yuboring.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-new',
        role: 'model',
        content: "Chat tozalandi. Menga istalgan savolingizni berishingiz mumkin!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="relative"
        >
          {/* Animated Pulsing Rings */}
          <span className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-rose-500 opacity-75 blur-md animate-pulse" />

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-slate-900 text-white shadow-2xl border border-slate-700/80 hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-white animate-bounce" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
            </div>

            <div className="text-left pr-1">
              <div className="text-[13px] font-bold flex items-center gap-1.5 leading-none">
                LaborMarket AI
                <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
              </div>
              <span className="text-[10px] text-slate-400">Karyera va Vakansiya AI</span>
            </div>
          </button>
        </motion.div>
      )}

      {/* Expandable Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`w-[360px] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden border ${
              darkMode
                ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-xl'
                : 'bg-white/95 border-slate-200 text-slate-800 backdrop-blur-xl'
            }`}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1.5 font-heading">
                    LaborMarket AI
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-normal">
                      Gemini 3.8
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Virtual kiber-maslahatchi</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={clearChat}
                  title="Chatni tozalash"
                  className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Yopish"
                  className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mode Selector Pill */}
            <div className="px-4 py-2 border-b border-slate-700/20 flex items-center justify-between text-xs bg-slate-500/5">
              <span className="text-slate-400 font-medium">Rejim:</span>
              <div className="flex rounded-lg overflow-hidden border border-slate-700/30 p-0.5 bg-slate-950/20">
                <button
                  onClick={() => setActiveRoleMode('job_seeker')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    activeRoleMode === 'job_seeker'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ish izlovchi
                </button>
                <button
                  onClick={() => setActiveRoleMode('employer')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    activeRoleMode === 'employer'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ish beruvchi
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 relative group ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md'
                        : darkMode
                        ? 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-slate-700/60 shadow'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/10 dark:border-white/10 text-[10px] opacity-70">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'model' && (
                        <button
                          onClick={() => copyToClipboard(msg.id, msg.content)}
                          className="hover:opacity-100 flex items-center gap-1 transition-opacity ml-2"
                          title="Nusxalash"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              Nusxalandi
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Nusxa
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center animate-spin">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <span>LaborMarket AI o'ylamoqda...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Chips */}
            <div className="px-4 py-2 border-t border-slate-700/20 overflow-x-auto flex gap-1.5 no-scrollbar bg-slate-500/5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qp)}
                  className={`text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full border transition-all ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-slate-700/30 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Savolingizni yozing..."
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 rounded-full text-xs outline-none transition-all ${
                  darkMode
                    ? 'bg-slate-800 border border-slate-700 text-slate-100 focus:border-indigo-500'
                    : 'bg-slate-100 border border-slate-300 text-slate-800 focus:border-indigo-600'
                }`}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:opacity-95 disabled:opacity-40 transition-opacity shadow-md flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
