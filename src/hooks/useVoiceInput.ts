'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useVoiceInput(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() =>
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );

  // Keep onTranscript stable via ref so start() closure never goes stale
  const transcriptRef = useRef(onTranscript);
  useEffect(() => { transcriptRef.current = onTranscript; }, [onTranscript]);

  const recRef = useRef<any>(null);
  // Flag so onend knows whether WE stopped it (vs auto-stop)
  const stoppingRef = useRef(false);

  const stop = useCallback(() => {
    stoppingRef.current = true;
    recRef.current?.abort();
    recRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!supported) return;
    // Clean up any previous instance
    if (recRef.current) {
      stoppingRef.current = true;
      recRef.current.abort();
      recRef.current = null;
    }

    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;       // keep listening until explicitly stopped
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      // Collect all new final results since last call
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) text += e.results[i][0].transcript + ' ';
      }
      if (text.trim()) transcriptRef.current(text.trim());
    };

    rec.onend = () => {
      // Only update state if we didn't already set it in stop()
      if (!stoppingRef.current) setListening(false);
      stoppingRef.current = false;
    };

    rec.onerror = (e: any) => {
      // 'aborted' is expected when we call abort() — ignore it
      if (e.error !== 'aborted') setListening(false);
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

  // Clean up on unmount
  useEffect(() => () => { stoppingRef.current = true; recRef.current?.abort(); }, []);

  return { listening, supported, toggle };
}
