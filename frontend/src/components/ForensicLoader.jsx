/**
 * ForensicLoader — immersive multi-stage AI analysis loading experience.
 * Replaces the generic spinner with a terminal-style forensic pipeline display.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Upload, Cpu, Brain, Search, FileText, CheckCircle2, Loader2,
} from 'lucide-react';

const STAGES = [
  { id: 0, icon: Upload,       label: 'Uploading media',                  detail: 'Transferring image to analysis server…',       duration: 600  },
  { id: 1, icon: Cpu,          label: 'Preprocessing image',              detail: 'Resizing · normalizing · tensor conversion…',  duration: 700  },
  { id: 2, icon: Brain,        label: 'Running neural authenticity scan', detail: 'CNN inference · 224×224 feature extraction…',  duration: 1100 },
  { id: 3, icon: Search,       label: 'Detecting synthetic artifacts',    detail: 'Analyzing texture gradients · GAN patterns…',  duration: 900  },
  { id: 4, icon: FileText,     label: 'Generating forensic explanation',  detail: 'Querying Gemini AI · composing report…',       duration: 800  },
  { id: 5, icon: CheckCircle2, label: 'Finalizing authenticity report',   detail: 'Compiling results · preparing verdict…',       duration: 400  },
];

/* ── Terminal log line ── */
const LogLine = ({ stage, state }) => {
  const Icon = stage.icon;
  const color =
    state === 'done'    ? 'text-neon-green' :
    state === 'active'  ? 'text-cyber-300'  :
                          'text-dark-600';
  const prefix =
    state === 'done'   ? '✓' :
    state === 'active' ? '▶' :
                         '○';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: state === 'pending' ? 0.35 : 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-3 py-1.5 font-mono text-xs ${color}`}
    >
      <span className="w-4 text-center shrink-0">{prefix}</span>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="flex-1">{stage.label}</span>
      {state === 'active' && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }}
          className="text-cyber-400"
        >
          …
        </motion.span>
      )}
    </motion.div>
  );
};

/* ── Main component ── */
const ForensicLoader = ({ isVisible }) => {
  const [activeStage, setActiveStage] = useState(0);
  const [elapsed,     setElapsed]     = useState(0);

  /* Advance through stages based on their durations */
  useEffect(() => {
    if (!isVisible) { setActiveStage(0); setElapsed(0); return; }

    let cumulative = 0;
    const timers = STAGES.map((stage, i) => {
      const t = setTimeout(() => setActiveStage(i), cumulative);
      cumulative += stage.duration;
      return t;
    });

    /* Elapsed counter */
    const tick = setInterval(() => setElapsed((e) => e + 100), 100);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, [isVisible]);

  const totalDuration = STAGES.reduce((s, st) => s + st.duration, 0);
  const progress = Math.min((elapsed / totalDuration) * 100, 95); // cap at 95 until real result

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="forensic-loader"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="py-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-transparent
                           border-t-cyber-400 border-r-cyber-400/40"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-cyber-400" />
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Forensic Analysis Running</p>
              <p className="text-dark-700 text-xs font-mono">
                DeepGuard AI · {(elapsed / 1000).toFixed(1)}s elapsed
              </p>
            </div>
            <div className="ml-auto badge-cyan text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-400 animate-pulse" />
              LIVE
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-dark-700">
              <span>Pipeline progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyber-600 to-cyber-400"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'linear' }}
              />
            </div>
          </div>

          {/* Terminal log */}
          <div className="rounded-xl bg-dark-100/80 border border-white/8 p-4 space-y-0.5">
            <p className="text-dark-600 text-[10px] font-mono uppercase tracking-widest mb-3">
              ── Analysis Pipeline ──
            </p>
            {STAGES.map((stage) => {
              const state =
                stage.id < activeStage  ? 'done'    :
                stage.id === activeStage ? 'active'  :
                                           'pending';
              return <LogLine key={stage.id} stage={stage} state={state} />;
            })}
          </div>

          {/* Active stage detail */}
          <motion.p
            key={activeStage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-dark-700 text-xs font-mono"
          >
            {STAGES[activeStage]?.detail}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForensicLoader;
