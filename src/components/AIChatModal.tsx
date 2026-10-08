import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Trash2,
  RefreshCw,
  Layers,
  ShoppingCart,
  CheckCircle2,
  Cpu,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { useStore } from '../store';
import { formatPrice } from '../lib/format';
import { Component, Category } from '../types';
import { componentsById } from '../data/components';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedBuild?: {
    name: string;
    totalPrice: number;
    componentIds: string[];
    components: Component[];
  };
  suggestedReplies?: string[];
}

const QUICK_PROMPTS = [
  'Cyberpunk 2077 Ultra sozlamada',
  'Upgrade boʻyicha maslahat',
  '10 mln soʻmga oʻyin kompyuteri',
  'CS2 uchun 240 FPS yigʻma',
];

export function AIChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadBuild = useStore((s) => s.loadBuild);
  const addToCart = useStore((s) => s.addToCart);

  // Chat history state with localStorage session persistence
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('pcforge_ai_chat');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'Assalomu alaykum! Men PCForge doʻkonining aqlli AI maslahatchisiman.\n\nSizga:\n• Oʻyinlar boʻyicha talab va mos yigʻma (masalan: "Cyberpunk 2077 ni Ultra sozlamada oʻynamoqchiman")\n• Mavjud kompyuteringizni upgrade qilish boʻyicha aniq maslahat (masalan: "i3 va GTX 1050 Ti bor, nimalarni yangilasam boʻladi?")\n• Byudjetingizga mos 100% mos keluvchi yangi yigʻma tuzishda yordam bera olaman!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedReplies: [
          'Cyberpunk 2077 ni Ultra sozlamada oʻynamoqchiman',
          'Menda i3 va GTX 1050 Ti bor, upgrade maslahati bering',
          '10 mln soʻmga oʻyin kompyuteri taklif qiling',
        ],
      },
    ];
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('pcforge_ai_chat', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (userText: string) => {
    const textToSend = userText.trim();
    if (!textToSend || isLoading) return;

    setLastFailedMessage(null);
    setInput('');

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, newMsg];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Server javob bermadi');
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text || 'Tavsiya tayyorlandi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedBuild: data.recommendedBuild,
        suggestedReplies: data.suggestedReplies || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setLastFailedMessage(textToSend);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Kechirasiz, hozir javob bera olmayman, iltimos qayta urinib koʻring.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedReplies: [
          'Cyberpunk 2077 ni Ultra sozlamada oʻynash',
          'Mavjud kompyuterimni upgrade qilish',
          '10 mln soʻmga oʻyin kompyuteri',
        ],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initialMsg: ChatMessage = {
      id: 'welcome',
      sender: 'assistant',
      text: 'Suhbat tozalandi. Qanday yangi savolingiz bor?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialMsg]);
    sessionStorage.removeItem('pcforge_ai_chat');
  };

  const handleLoadBuildToBuilder = (componentIds: string[]) => {
    const selection: Partial<Record<Category, Component>> = {};
    componentIds.forEach((id) => {
      const comp = componentsById[id];
      if (comp) selection[comp.category] = comp;
    });
    loadBuild(selection);
    setIsOpen(false);
    navigate(`/builder?build=${componentIds.join(',')}`);
  };

  const handleAddBuildToCart = (build: { name: string; totalPrice: number; componentIds: string[] }) => {
    const selection: Partial<Record<Category, Component>> = {};
    build.componentIds.forEach((id) => {
      const comp = componentsById[id];
      if (comp) selection[comp.category] = comp;
    });

    addToCart({
      id: `custom-build-${Date.now()}`,
      type: 'custom-build',
      name: build.name,
      price: build.totalPrice,
      quantity: 1,
      image: '',
      stock: 10,
      details: {
        components: selection,
        assemblyService: true,
      },
    });
    setIsOpen(false);
    navigate('/cart');
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] p-3.5 sm:p-4 text-white shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all group"
          aria-label="AI Maslahatchi chatini ochish"
        >
          <div className="relative">
            <Bot className="h-6 w-6 group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </div>
          <span className="hidden sm:inline font-semibold text-sm tracking-wide">
            AI Maslahatchi
          </span>
        </button>
      )}

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[440px] sm:h-[620px] z-50 flex flex-col rounded-none sm:rounded-2xl border border-[#1F2A44] bg-[#0B0F1A] shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1F2A44] bg-[#121829] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                  PCForge AI Maslahatchi
                  <span className="text-[10px] font-normal uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-[#94A3B8]">Gemini quvvatida ishlaydi</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#1F2A44] hover:text-white transition-colors"
                title="Suhbatni tozalash"
                aria-label="Suhbatni tozalash"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#1F2A44] hover:text-white transition-colors"
                aria-label="Yopish"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md'
                      : 'bg-[#121829] border border-[#1F2A44] text-[#E5E7EB] rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Render Recommended Build Card if present */}
                  {msg.recommendedBuild && (
                    <div className="mt-3.5 pt-3 border-t border-[#1F2A44]/70 bg-[#0B0F1A]/80 rounded-xl p-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-2">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Tavsiya etilgan yigʻma
                        </span>
                        <span className="text-white font-bold">{formatPrice(msg.recommendedBuild.totalPrice)}</span>
                      </div>
                      <div className="text-xs font-medium text-white line-clamp-1 mb-2">
                        {msg.recommendedBuild.name}
                      </div>

                      <div className="space-y-1 mb-3 max-h-32 overflow-y-auto text-[11px] text-[#94A3B8]">
                        {msg.recommendedBuild.components.map((comp) => (
                          <div key={comp.id} className="flex justify-between items-center py-0.5 border-b border-[#1F2A44]/40">
                            <span className="truncate pr-2">• {comp.name}</span>
                            <span className="text-slate-300 shrink-0">{formatPrice(comp.price)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadBuildToBuilder(msg.recommendedBuild!.componentIds)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#1F2A44] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
                        >
                          <Layers className="h-3.5 w-3.5" />
                          Builderʻda ochish
                        </button>
                        <button
                          onClick={() => handleAddBuildToCart(msg.recommendedBuild!)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Savatga
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Render Suggested Replies if present */}
                  {msg.sender === 'assistant' && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#1F2A44]/70">
                      <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-2">
                        <MessageSquare className="h-3 w-3 text-blue-400" />
                        <span>Davomiy savollar:</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {msg.suggestedReplies.map((reply, rIdx) => (
                          <button
                            key={rIdx}
                            type="button"
                            onClick={() => handleSendMessage(reply)}
                            disabled={isLoading}
                            className="group flex items-center justify-between gap-2 rounded-xl border border-[#1F2A44] bg-[#0B0F1A]/90 hover:bg-[#1A233A] hover:border-blue-500/70 px-3 py-2 text-xs text-slate-200 hover:text-white transition-all text-left disabled:opacity-50 active:scale-[0.98] shadow-sm cursor-pointer"
                          >
                            <span className="line-clamp-2 leading-tight">{reply}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-blue-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="mt-1 text-[10px] text-[#94A3B8] px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 rounded-2xl bg-[#121829] border border-[#1F2A44] px-4 py-3 text-xs text-[#94A3B8] w-fit">
                <Bot className="h-4 w-4 text-[#3B82F6] animate-pulse" />
                <span>AI javob tayyorlamoqda...</span>
                <span className="flex space-x-1">
                  <span className="h-1.5 w-1.5 bg-[#3B82F6] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 bg-[#3B82F6] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 bg-[#3B82F6] rounded-full animate-bounce"></span>
                </span>
              </div>
            )}

            {/* Error retry option */}
            {lastFailedMessage && !isLoading && (
              <div className="flex justify-center">
                <button
                  onClick={() => handleSendMessage(lastFailedMessage)}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Qayta yuborish
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="border-t border-[#1F2A44] bg-[#0E1424] px-3 py-2 overflow-x-auto">
            <div className="flex items-center gap-2 whitespace-nowrap">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="rounded-lg border border-[#1F2A44] bg-[#121829] px-2.5 py-1 text-xs text-[#E5E7EB] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="border-t border-[#1F2A44] bg-[#121829] p-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Savolingizni yozing (masalan: 12 mln so'mga CS2 uchun)..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-[#1F2A44] bg-[#0B0F1A] px-3.5 py-2.5 text-sm text-[#E5E7EB] placeholder-[#94A3B8] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6] text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
              aria-label="Xabarni yuborish"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
