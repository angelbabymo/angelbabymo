'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Callbacks {
  onFinal:   (text: string) => void;
  onInterim: (text: string) => void;
}

export function useVoiceInput({ onFinal, onInterim }: Callbacks) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() =>
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );

  const finalRef   = useRef(onFinal);
  const interimRef = useRef(onInterim);
  useEffect(() => { finalRef.current = onFinal; interimRef.current = onInterim; }, [onFinal, onInterim]);

  const recRef      = useRef<any>(null);
  const stoppingRef = useRef(false);

  const stop = useCallback(() => {
    stoppingRef.current = true;
    recRef.current?.abort();
    recRef.current = null;
    setListening(false);
    interimRef.current(''); // clear live preview
  }, []);

  const start = useCallback(() => {
    if (!supported) return;
    if (recRef.current) { stoppingRef.current = true; recRef.current.abort(); recRef.current = null; }

    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang            = 'en-US';
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      let interim = '';
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + ' ';
        else interim += t;
      }
      if (interim)          interimRef.current(interim);
      if (finalText.trim()) finalRef.current(finalText.trim());
    };

    rec.onend = () => {
      if (!stoppingRef.current) { setListening(false); interimRef.current(''); }
      stoppingRef.current = false;
    };

    rec.onerror = (e: any) => {
      if (e.error !== 'aborted') { setListening(false); interimRef.current(''); }
      stoppingRef.current = false;
    };

    stoppingRef.current = false;
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [supported]);

  const toggle = useCallback(() => {
    if (recRef.current) stop();
    else start();
  }, [start, stop]);

  useEffect(() => () => { stoppingRef.current = true; recRef.current?.abort(); }, []);

  return { listening, supported, toggle };
}
