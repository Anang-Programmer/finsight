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
        body: JSON.stringify({ 
          messages: [...messages, userMsg].filter(m => m.id !== 'welcome').map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
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
    <>
      <style>{`
        .page-content {
          padding: 0 !important;
          max-width: none !important;
        }
      `}</style>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 64px)', /* viewport minus topbar */
        background: 'var(--canvas)',
        overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--hairline-dark)', zIndex: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: 'var(--primary-bright)' }} />
            <h2 className="text-heading-sm">Finsight AI</h2>
          </div>
          <button onClick={startNewChat} className="btn btn-soft btn-sm" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
            <RefreshCw size={14} />
            <span className="hide-mobile">Mulai Chat Baru</span>
          </button>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflowY: 'auto' }}>
          <div className="chat-messages" style={{ padding: '32px 24px', flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
        <div style={{ padding: '24px', background: 'linear-gradient(to top, var(--canvas) 60%, transparent)' }}>
          <form onSubmit={handleSubmit} style={{ 
            display: 'flex', 
            gap: '12px',
            background: 'var(--surface-elevated)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            maxWidth: '800px',
            margin: '0 auto',
            alignItems: 'center'
          }}>
            <input
              type="text"
              style={{ 
                flex: 1, 
                background: 'transparent', 
                border: 'none', 
                outline: 'none', 
                color: 'var(--on-dark)',
                fontSize: '15px',
                padding: '0 16px',
                fontFamily: 'inherit'
              }}
              placeholder="Tanya Finsight AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-brand btn-icon"
              style={{ 
                borderRadius: 'var(--radius-full)', 
                width: '40px', 
                height: '40px',
                flexShrink: 0 
              }}
              disabled={!input.trim() || isLoading}
            >
              <Send size={18} />
            </button>
          </form>
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--stone)', marginTop: '16px' }}>
            Finsight AI dapat membuat kesalahan. Cek kembali keakuratan data.
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
