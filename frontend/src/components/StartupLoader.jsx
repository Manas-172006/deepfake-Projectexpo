import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, Server, AlertTriangle } from 'lucide-react';
import { checkHealth } from '../services/api';

const STAGES = [
  { text: 'Initializing Detection Engine...', minProgress: 0, maxProgress: 15 },
  { text: 'Loading CNN Model (ResNet/DenseNet Core)...', minProgress: 15, maxProgress: 35 },
  { text: 'Loading Explainability Module (Grad-CAM)...', minProgress: 35, maxProgress: 55 },
  { text: 'Connecting FastAPI Backend on Port 8000...', minProgress: 55, maxProgress: 75 },
  { text: 'Preparing Visualization Pipeline...', minProgress: 75, maxProgress: 90 },
  { text: 'Launching Platform...', minProgress: 90, maxProgress: 100 },
];

const StartupLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking' | 'connected' | 'sandbox'
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timer;
    const totalDuration = 3500; // 3.5 seconds loading experience
    const intervalTime = 40;
    const step = 100 / (totalDuration / intervalTime);

    // Active backend ping at stage 4 (progress 55% - 75%)
    let backendChecked = false;

    const runLoading = async () => {
      timer = setInterval(async () => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            // Wait slightly before complete callback for transition
            setTimeout(() => {
              setVisible(false);
              setTimeout(onComplete, 400);
            }, 600);
            return 100;
          }

          const nextProgress = prev + step;

          // Check Stage transitions
          const activeStage = STAGES.findIndex(
            (s) => nextProgress >= s.minProgress && nextProgress < s.maxProgress
          );
          if (activeStage !== -1) {
            setCurrentStageIndex(activeStage);
          } else if (nextProgress >= 100) {
            setCurrentStageIndex(STAGES.length - 1);
          }

          // Trigger API check around 60% progress
          if (nextProgress >= 60 && !backendChecked) {
            backendChecked = true;
            checkHealth().then((res) => {
              if (res.success && res.data?.model_loaded) {
                setConnectionStatus('connected');
              } else {
                setConnectionStatus('sandbox');
              }
            });
          }

          return nextProgress;
        });
      }, intervalTime);
    };

    runLoading();

    return () => {
      clearInterval(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="startup-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#03030d] overflow-hidden"
        >
          {/* Animated Background Overlay */}
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-cyan-600/5 blur-[80px] pointer-events-none" />

          {/* Logo Brand Animation */}
          <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative mb-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-500 to-[#7c3aed] flex items-center justify-center shadow-cyber relative">
                <ShieldCheck className="w-9 h-9 text-white" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-2xl border-2 border-dashed border-white/20"
                />
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-black text-white tracking-tight leading-none mb-2"
            >
              FakeProof<span className="gradient-text"> Labs</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.3 }}
              className="text-xs font-mono tracking-widest text-[#8888bb] uppercase mb-12"
            >
              Advanced Digital Media Forensics
            </motion.p>

            {/* Stage Text Loader */}
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-xs font-mono text-[#8888bb]">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 text-cyber-400 animate-spin" />
                  <span className="truncate max-w-[280px]">
                    {STAGES[currentStageIndex]?.text}
                  </span>
                </div>
                <span className="font-bold text-white text-right shrink-0">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-1.5 w-full rounded-full bg-white/[0.05] border border-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyber-500 via-cyber-400 to-[#7c3aed]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>

              {/* Server Connection Status */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: progress >= 60 ? 1 : 0 }}
                className="flex items-center justify-center gap-2 text-[11px] font-mono"
              >
                {connectionStatus === 'checking' && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-cyber-400 animate-spin" />
                    <span className="text-[#8888bb]">Testing FastAPI connection...</span>
                  </>
                )}
                {connectionStatus === 'connected' && (
                  <>
                    <Server className="w-3.5 h-3.5 text-neon-green" />
                    <span className="text-neon-green font-semibold">FastAPI Backend Connected</span>
                  </>
                )}
                {connectionStatus === 'sandbox' && (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-yellow-500 font-semibold">Backend Offline — Running in Demo Sandbox</span>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartupLoader;
