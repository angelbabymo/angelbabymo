'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, Video, FlipHorizontal, Circle, Square, RotateCcw, Download } from 'lucide-react';

type Mode = 'photo' | 'video';

interface Props {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string) => void;
}

export function CameraModal({ open, onClose, onCapture }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);

  const [mode, setMode]           = useState<Mode>('video');
  const [facingMode, setFacing]   = useState<'environment' | 'user'>('environment');
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed]     = useState(0);
  const [preview, setPreview]     = useState<{ url: string; type: Mode } | null>(null);
  const [error, setError]         = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width:     { ideal: 1920, min: 1280 },
          height:    { ideal: 1080, min: 720 },
          frameRate: { ideal: 60,   min: 30  },
        },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      setError('Camera access denied. Please allow camera permission and try again.');
    }
  }, []);

  useEffect(() => {
    if (open && !preview) startCamera(facingMode);
    return () => {
      if (!open) {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [open, facingMode, preview, startCamera]);

  const flipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacing(next);
    startCamera(next);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setPreview({ url, type: 'photo' });
      streamRef.current?.getTracks().forEach(t => t.stop());
    }, 'image/jpeg', 0.97);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')
      ? 'video/mp4;codecs=h264,aac'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 8_000_000, // 8 Mbps — high quality
    });
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url  = URL.createObjectURL(blob);
      setPreview({ url, type: 'video' });
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
    recorder.start(100);
    recorderRef.current = recorder;
    setRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const retake = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
    startCamera(facingMode);
  };

  const useCapture = async () => {
    if (!preview) return;
    const res  = await fetch(preview.url);
    const blob = await res.blob();
    const ext  = preview.type === 'photo' ? 'jpg' : 'mp4';
    const file = new File([blob], `creator-os-capture.${ext}`, { type: blob.type });
    onCapture(file, preview.url);
    onClose();
  };

  const saveToPhotos = async () => {
    if (!preview) return;
    const res  = await fetch(preview.url);
    const blob = await res.blob();
    const ext  = preview.type === 'photo' ? 'jpg' : 'mp4';
    const file = new File([blob], `creator-os-capture.${ext}`, { type: blob.type });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Save to Photos' });
      } else {
        const a = document.createElement('a');
        a.href = preview.url;
        a.download = file.name;
        a.click();
      }
    } catch { /* user cancelled share sheet */ }
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-3 absolute top-0 left-0 right-0 z-10">
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <X size={18} color="white" />
        </button>

        {!preview && (
          <div className="flex gap-1 rounded-full p-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
            {(['photo', 'video'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="px-4 py-1 rounded-full text-[12px] font-semibold capitalize transition-all"
                style={{
                  background: mode === m ? 'white' : 'transparent',
                  color:      mode === m ? '#000'   : 'rgba(255,255,255,0.7)',
                }}>
                {m}
              </button>
            ))}
          </div>
        )}

        {!preview && (
          <button onClick={flipCamera} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <FlipHorizontal size={18} color="white" />
          </button>
        )}
        {preview && <div className="w-9" />}
      </div>

      {/* Viewfinder / Preview */}
      <div className="flex-1 relative overflow-hidden">
        {!preview ? (
          <video ref={videoRef} autoPlay playsInline muted
            className="w-full h-full object-cover" style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
        ) : preview.type === 'photo' ? (
          <img src={preview.url} alt="capture" className="w-full h-full object-cover" />
        ) : (
          <video src={preview.url} controls autoPlay loop playsInline
            className="w-full h-full object-contain" style={{ background: '#000' }} />
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <p className="text-white text-[14px]">{error}</p>
          </div>
        )}

        {recording && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.6)' }}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-[13px] text-white">{fmt(elapsed)}</span>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-8 pb-safe pb-8 pt-6 flex items-center justify-between"
        style={{ background: 'rgba(0,0,0,0.85)' }}>
        {!preview ? (
          <>
            <div className="w-10" />
            {mode === 'photo' ? (
              <button onClick={takePhoto}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform">
                <Camera size={26} color="white" />
              </button>
            ) : (
              <button
                onClick={recording ? stopRecording : startRecording}
                className="w-16 h-16 rounded-full border-4 flex items-center justify-center active:scale-95 transition-transform"
                style={{ borderColor: recording ? '#ff3c6e' : 'white' }}>
                {recording
                  ? <Square size={22} color="#ff3c6e" fill="#ff3c6e" />
                  : <Circle size={26} color="#ff3c6e" fill="#ff3c6e" />}
              </button>
            )}
            <div className="w-10" />
          </>
        ) : (
          <>
            <button onClick={retake} className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <RotateCcw size={18} color="white" />
              </div>
              <span className="text-[11px] text-white/70">Retake</span>
            </button>

            <button onClick={useCapture}
              className="px-8 py-3 rounded-full font-semibold text-[14px] active:scale-95 transition-transform"
              style={{ background: 'var(--red)', color: 'white' }}>
              Use {mode === 'photo' ? 'Photo' : 'Video'}
            </button>

            <button onClick={saveToPhotos} className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <Download size={18} color="white" />
              </div>
              <span className="text-[11px] text-white/70">Save</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
