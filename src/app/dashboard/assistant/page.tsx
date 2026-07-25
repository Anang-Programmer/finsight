'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('Kamu');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0]);
      }
    };
    fetchUser();
    
    // Load chat history from sessionStorage
    const cached = sessionStorage.getItem('finsight_ai_chat');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Revive dates
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch {
        startNewChat();
      }
    } else {
      startNewChat();
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      sessionStorage.setItem('finsight_ai_chat', JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  const startNewChat = () => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: 'Halo! Saya Finsight AI, asisten keuangan personalmu. Saya bisa bantu analisis pengeluaranmu bulan ini, lihat status anggaran, atau kasih tips nabung. Ada yang ingin ditanyakan?',
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
    sessionStorage.setItem('finsight_ai_chat', JSON.stringify([welcomeMsg]));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const assistantMsgId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });

      if (!res.ok) throw new Error('Gagal merespons');
      if (!res.body) throw new Error('ReadableStream not supported');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  )
                );
              } catch {
                // Ignore parse errors on chunks
              }
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: 'Maaf, terjadi kesalahan saat mencoba menjawab. Silakan coba lagi.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            background: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--on-primary)',
          }}
        >
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-heading-sm">Finsight AI</h2>
          <p style={{ color: 'var(--primary-bright)', fontSize: '13px', fontWeight: '500' }}>
            Online • Berbasis data keuanganmu
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={startNewChat} className="btn btn-soft btn-sm" style={{ padding: '8px 16px', height: '36px' }}>
            <RefreshCw size={14} />
            Chat Baru
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        <div className="chat-messages" style={{ padding: '24px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--stone)' }}>
                {msg.role === 'assistant' ? (
                  <>
                    <Bot size={14} /> Finsight AI
                  </>
                ) : (
                  <>
                    {userName} <User size={14} />
                  </>
                )}
              </div>
              <div
                className={`chat-bubble ${
                  msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                }`}
              >
                {msg.content ? (
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p style={{ marginBottom: '8px' }} {...props} />,
                      strong: ({ node, ...props }) => <strong style={{ fontWeight: '600' }} {...props} />,
                      ul: ({ node, ...props }) => <ul style={{ paddingLeft: '16px', marginBottom: '8px', listStyleType: 'disc' }} {...props} />,
                      li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }} {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: '200ms' }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: '400ms' }}>●</span>
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--stone)' }}>
                {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--divider-soft)', background: 'var(--surface-elevated)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="input"
              style={{ background: 'var(--canvas)', border: '1px solid var(--divider-soft)' }}
              placeholder="Tanya soal pengeluaran, sisa anggaran, dll..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-brand btn-icon"
              disabled={!input.trim() || isLoading}
            >
              <Send size={18} />
            </button>
          </form>
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--stone)', marginTop: '12px' }}>
            AI dapat membuat kesalahan. Cek kembali data keuangan Anda.
          </div>
        </div>
      </div>
    </div>
  );
}
