'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ModelBar } from '@/components/ModelBar';
import { 
  Send, 
  Trash2, 
  Volume2, 
  Copy, 
  Check, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw,
  UserCheck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function ChatPage() {
  const { t, isRtl, settings, addHistoryItem, requireAuth } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t.chatWelcome,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], content: t.chatWelcome }];
      }
      return prev;
    });
  }, [t.chatWelcome]);

  const roles = [
    { id: 'general', name: t.roleGeneral },
    { id: 'writer', name: t.roleWriter },
    { id: 'coder', name: t.roleCoder },
    { id: 'teacher', name: t.roleTeacher },
    { id: 'business', name: t.roleBusiness },
  ];

  const getSystemPrompt = () => {
    switch (selectedRole) {
      case 'writer':
        return 'You are an elite expert in Uyghur language, literature, culture, and rich poetic expression. Always respond in fluent, eloquent, and authentic Uyghur (Arabic script) unless English is explicitly requested.';
      case 'coder':
        return 'You are a senior full-stack software engineer. Provide high quality, secure code with clean comments and explanations in the requested language.';
      case 'teacher':
        return 'You are an engaging, patient teacher who explains complex concepts with simple analogies and step-by-step clarity.';
      case 'business':
        return 'You are a strategic marketing and business advisor with deep knowledge of international trade, branding, and modern economics.';
      default:
        return 'You are a helpful, respectful, and highly intelligent AI assistant. If the user writes in Uyghur, respond in natural, polite Uyghur (Arabic script). If the user writes in English, respond in English.';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!requireAuth()) return;
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model: settings.featureModels.chat,
          provider: settings.featureProviders.chat,
          systemPrompt: getSystemPrompt(),
          openRouterApiKey: settings.openRouterApiKey,
          geminiApiKey: settings.geminiApiKey,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            role: 'assistant',
            content: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.',
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      const assistantMsg: ChatMessage = {
        id: 'a-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'جاۋاب قۇرۇق كەلدى.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Save to history
      addHistoryItem({
        type: 'chat',
        title: userMsg.content.slice(0, 30),
        preview: assistantMsg.content.slice(0, 60),
        data: {
          userMessage: userMsg.content,
          reply: assistantMsg.content,
          model: settings.featureModels.chat,
        },
      });
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: 'ۋاقىتلىق خاتالىق كۆرۈلدى، قايتا سىناپ بېقىڭ.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: t.chatResetNotice,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8.5rem)] animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Model Selector Bar */}
      <ModelBar feature="chat" featureTitle={t.fChatTitle} />

      {/* Role Picker Bar */}
      <div className="flex items-center justify-between gap-2 px-1 mb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-[80%] custom-scrollbar">
          <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">{t.chatRoleSelect}</span>
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                selectedRole === r.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/40'
                  : 'bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-xs px-3 py-1.5 text-slate-400 hover:text-rose-400 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:border-rose-500/30 transition-all shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.newChat}</span>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-5 rounded-3xl tech-card border border-white/[0.08] custom-scrollbar shadow-xl">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-600/30'
                    : 'bg-white/[0.05] border border-white/[0.1] text-indigo-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl p-4.5 space-y-2 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-md shadow-indigo-600/20 border border-indigo-400/20'
                    : 'bg-white/[0.03] border border-white/[0.08] text-slate-100 rounded-tl-none shadow-sm backdrop-blur-md'
                }`}
              >
                <div className="whitespace-pre-wrap select-text">{m.content}</div>

                {/* Actions for Assistant */}
                {!isUser && (
                  <div className="pt-2.5 flex items-center gap-3 border-t border-white/[0.06] text-slate-400 text-xs">
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-white flex items-center gap-1 transition"
                      title={t.copy}
                    >
                      {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === m.id ? t.copied : t.copy}</span>
                    </button>
                    <button
                      onClick={() => handleSpeak(m.content)}
                      className="hover:text-indigo-400 flex items-center gap-1 transition"
                      title={t.readAloud}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t.readAloud}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-indigo-400 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
            <div className="p-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>{t.loading}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="pt-3">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t.chatPlaceholder}
            rows={2}
            className="w-full bg-[#0d0f17] border border-white/[0.1] rounded-2xl py-3 px-4 pe-14 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 resize-none shadow-xl transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute end-2 p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white transition-all shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
