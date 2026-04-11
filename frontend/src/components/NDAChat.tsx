'use client';

import { useEffect, useRef, useState } from 'react';
import { NDAFormData } from '@/lib/ndaTemplate';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  onFieldsUpdate: (fields: Partial<NDAFormData>) => void;
  isComplete: boolean;
}

export default function NDAChat({ onFieldsUpdate, isComplete }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const FALLBACK_GREETING = "Hi! I'm here to help you draft a Mutual NDA. What's the purpose of this agreement?";

  // Fetch greeting on mount
  useEffect(() => {
    fetch('/api/chat/greeting')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setMessages([{ role: 'assistant', content: data.message || FALLBACK_GREETING }]);
      })
      .catch(() => {
        setMessages([{ role: 'assistant', content: FALLBACK_GREETING }]);
      });
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-focus input after AI responds
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      if (data.fields && Object.keys(data.fields).length > 0) {
        onFieldsUpdate(data.fields);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I ran into an issue. Could you try again?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-slate-200 bg-white">
        <h1 className="text-base font-semibold text-[#032147]">Mutual NDA Assistant</h1>
        <p className="text-xs text-[#888888] mt-0.5">
          Chat with AI to fill in your agreement — the preview updates as we go.
        </p>
        {isComplete && (
          <div className="mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
            All fields gathered — download the PDF from the preview panel.
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#209dd7] text-white rounded-br-sm'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your message…"
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#209dd7] focus:border-transparent disabled:opacity-50 transition"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-[#753991] hover:bg-[#5f2c75] disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
