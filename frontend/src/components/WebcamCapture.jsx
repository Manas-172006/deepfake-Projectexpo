/**
 * WebcamCapture — live camera modal for capturing frames and sending to analysis.
 * Uses the browser MediaDevices API — no extra dependencies needed.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, ZoomIn, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

/* ── Convert canvas to File ── */
const canvasToFile = (canvas, filename = 'webcam-capture.jpg') =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], filename, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  });

/* ── Main component ── */
const WebcamCapture = ({ onCapture, disabled }) => {
  const [open,       setOpen]       = useState(false);
  const [streaming,  setStreaming]   = useState(false);
  const [captured,   setCaptured]   = useState(null); // data URL preview
  const [error,      setError]      = useState(null);
  const [starting,   setStarting]   = useState(false);

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  /* ── Start camera ── */
  const startCamera = useCallback(async () => {
    setError(null);
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setStreaming(true);
          setStarting(false);
        };
      }
    } catch (err) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permissions and try again.'
          : 'Could not access camera. Make sure no other app is using it.',
      );
      setStarting(false);
    }
  }, []);

  /* ── Stop camera ── */
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  }, []);

  /* ── Open modal ── */
  const handleOpen = () => {
    setCaptured(null);
    setError(null);
    setOpen(true);
  };

  /* ── Close modal ── */
  const handleClose = () => {
    stopCamera();
    setCaptured(null);
    setOpen(false);
  };

  /* ── Capture frame ── */
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL('image/jpeg', 0.92));
    stopCamera();
  }, [stopCamera]);

  /* ── Retake ── */
  const handleRetake = () => {
    setCaptured(null);
    startCamera();
  };

  /* ── Use captured frame ── */
  const handleUse = async () => {
    if (!canvasRef.current) return;
    const file = await canvasToFile(canvasRef.current);
    onCapture(file);
    handleClose();
  };

  /* Start camera when modal opens */
  useEffect(() => {
    if (open && !captured) startCamera();
    return () => { if (!open) stopCamera(); };
  }, [open]);

  /* Cleanup on unmount */
  useEffect(() => () => stopCamera(), []);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        disabled={disabled}
        className="btn-ghost flex-1 py-3 text-sm gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Capture from webcam"
      >
        <Camera className="w-4 h-4" />
        <span className="hidden sm:inline">Use Webcam</span>
        <span className="sm:hidden">Camera</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="webcam-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-card border-glow w-full max-w-2xl overflow-hidden shadow-glass"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyber-500/15 border border-cyber-500/30
                                  flex items-center justify-center">
                    <Camera className="w-4 h-4 text-cyber-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Live Capture</p>
                    <p className="text-dark-700 text-[10px] font-mono">
                      {streaming ? 'Camera active · Position your subject' : captured ? 'Frame captured' : 'Initializing…'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10
                             flex items-center justify-center text-dark-700
                             hover:text-neon-red hover:border-neon-red/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video / Preview area */}
              <div className="relative bg-dark-100 aspect-video overflow-hidden">
                {/* Live video */}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${captured ? 'hidden' : ''}`}
                  playsInline
                  muted
                />

                {/* Captured preview */}
                {captured && (
                  <img src={captured} alt="Captured frame" className="w-full h-full object-cover" />
                )}

                {/* Starting overlay */}
                {starting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3
                                  bg-dark-100">
                    <Loader2 className="w-8 h-8 text-cyber-400 animate-spin" />
                    <p className="text-dark-700 text-sm font-mono">Requesting camera access…</p>
                  </div>
                )}

                {/* Error overlay */}
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3
                                  bg-dark-100 p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-neon-red" />
                    <p className="text-neon-red text-sm font-semibold">Camera Error</p>
                    <p className="text-dark-700 text-xs max-w-xs">{error}</p>
                  </div>
                )}

                {/* Viewfinder overlay when streaming */}
                {streaming && !captured && (
                  <>
                    {/* Corner brackets */}
                    {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
                      <div
                        key={pos}
                        className={`absolute ${pos} w-6 h-6 border-cyber-400/70
                          ${pos.includes('top') && pos.includes('left')    ? 'border-t-2 border-l-2' : ''}
                          ${pos.includes('top') && pos.includes('right')   ? 'border-t-2 border-r-2' : ''}
                          ${pos.includes('bottom') && pos.includes('left')  ? 'border-b-2 border-l-2' : ''}
                          ${pos.includes('bottom') && pos.includes('right') ? 'border-b-2 border-r-2' : ''}
                        `}
                      />
                    ))}
                    {/* Live badge */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2">
                      <span className="badge bg-neon-red/20 border-neon-red/40 text-neon-red text-[10px] gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-red animate-pulse" />
                        LIVE
                      </span>
                    </div>
                  </>
                )}

                {/* Captured badge */}
                {captured && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-cyan text-[10px] gap-1.5">
                      <ZoomIn className="w-3 h-3" />
                      Frame Captured
                    </span>
                  </div>
                )}
              </div>

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Footer actions */}
              <div className="flex gap-3 p-4 border-t border-white/8">
                {!captured ? (
                  <>
                    <button onClick={handleClose} className="btn-ghost flex-1 py-2.5 text-sm">
                      Cancel
                    </button>
                    <button
                      onClick={handleCapture}
                      disabled={!streaming}
                      className="btn-cyber flex-1 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Frame
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleRetake} className="btn-ghost flex-1 py-2.5 text-sm">
                      <RotateCcw className="w-4 h-4" />
                      Retake
                    </button>
                    <button onClick={handleUse} className="btn-cyber flex-1 py-2.5 text-sm">
                      <ZoomIn className="w-4 h-4" />
                      Analyze This Frame
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WebcamCapture;
