'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Rocket, Loader2, RefreshCw, CalendarDays, Sparkles } from 'lucide-react';

export default function TimeMachinePage() {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [year, setYear] = useState(2026);
  const endRef = useRef<HTMLDivElement>(null);

  const startMachine = async () => {
    setIsStarted(true);
    setIsLoading(true);
    setPrediction('');
    setYear(2026);

    // Fast year animation (2026 to 2031 takes 3 seconds)
    const interval = setInterval(() => {
      setYear((prev) => {
        if (prev >= 2031) {
          clearInterval(interval);
          return 2031;
        }
        return prev + 1;
      });
    }, 600); // 5 steps * 600ms = 3000ms (3 detik)

    // Wait for the year animation to finish before calling AI
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const res = await fetch('/api/ai/timemachine', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Gagal mengakses mesin waktu');
      if (!res.body) throw new Error('Streaming tidak didukung');

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
                setPrediction((prev) => prev + data.content);
              } catch {
                // ignore
              }
            }
          }
        }
      }
    } catch (error) {
      setPrediction('⚠️ Mesin waktu rusak. Gagal meramal masa depan Anda. Coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [prediction]);

  return (
    <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(73, 79, 223, 0.15)', color: 'var(--primary-bright)', marginBottom: '16px' }}>
          <Rocket size={32} />
        </div>
        <h1 className="text-display-md" style={{ color: 'var(--on-dark)' }}>Finsight Time Machine</h1>
        <p style={{ color: 'var(--stone)', fontSize: '16px', marginTop: '8px', maxWidth: '500px', margin: '8px auto 0' }}>
          Berani melihat nasib finansial Anda 5 tahun ke depan berdasarkan kebiasaan Anda bulan ini?
        </p>
      </div>

      {/* Main Interaction Area */}
      {!isStarted ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--primary)', background: 'var(--surface-deep)' }}>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={startMachine}
            style={{ width: '100%', maxWidth: '300px', background: 'var(--primary-bright)', color: 'white' }}
          >
            <Sparkles size={20} /> Mulai Perjalanan
          </button>
          <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--stone)' }}>
            *Menggunakan AI untuk menghitung kecepatan bakar uang (Burn Rate) Anda.
          </p>
        </div>
      ) : (
        <div className="card" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--hairline-dark)' }}>
          {/* Dashboard Mesin Waktu */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--divider-soft)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: year === 2031 ? 'var(--accent-teal)' : 'var(--accent-warning)', animation: year < 2031 ? 'pulse 1s infinite' : 'none' }} />
              <span style={{ fontSize: '14px', color: 'var(--stone)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Status: {year === 2031 ? 'Tiba di Tujuan' : 'Melintasi Waktu...'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--on-dark)' }}>
              <CalendarDays size={20} style={{ color: 'var(--primary-bright)' }} />
              {year}
            </div>
          </div>

          {/* Hasil Prediksi */}
          <div style={{ minHeight: '200px' }}>
            {year < 2031 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '16px', color: 'var(--stone)' }}>
                <Rocket size={48} className="animate-bounce" style={{ color: 'var(--primary)' }} />
                <p style={{ fontSize: '16px', fontWeight: '500', animation: 'pulse 1s infinite' }}>Menembus lorong waktu ke tahun {year}...</p>
              </div>
            ) : (
              <div className="chat-bubble-assistant" style={{ background: 'transparent', padding: '0', color: 'var(--on-dark)' }}>
                {prediction ? (
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p style={{ marginBottom: '16px', fontSize: '15px', lineHeight: '1.6' }} {...props} />,
                      strong: ({ node, ...props }) => <strong style={{ fontWeight: '700', color: 'var(--primary-bright)' }} {...props} />,
                      ul: ({ node, ...props }) => <ul style={{ paddingLeft: '24px', marginBottom: '16px', listStyleType: 'circle' }} {...props} />,
                      li: ({ node, ...props }) => <li style={{ marginBottom: '8px', fontSize: '15px' }} {...props} />,
                      h3: ({ node, ...props }) => <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px', color: 'var(--on-dark)' }} {...props} />
                    }}
                  >
                    {prediction}
                  </ReactMarkdown>
                ) : (
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '20px' }}>
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: '200ms' }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: '400ms' }}>●</span>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>

          {/* Reset Button */}
          {year === 2031 && !isLoading && (
            <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid var(--divider-soft)', paddingTop: '24px' }}>
              <button className="btn btn-outline btn-sm" onClick={startMachine}>
                <RefreshCw size={14} /> Coba Prediksi Ulang
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
