/**
 * AIAnalysisCard
 * Displays the Gemini-generated forensic explanation with a typewriter effect,
 * an animated "AI thinking" state, and a Gemini-powered badge.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTypewriter } from '../hooks/useTypewriter';

/* ── Typing cursor ── */
const Cursor = ({ isDone }) =>
  !isDone ? (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
      className="inline-block w-0.5 h-4 bg-cyber-400 ml-0.5 align-middle"
    />
  ) : null;

/* ── Skeleton shimmer while text is empty ── */
const SkeletonLines = () => (
  <div className="space-y-2.5 mt-1">
    {[100, 90, 75].map((w) => (
      <div
        key={w}
        className="h-3 rounded-full bg-white/8 overflow-hidden"
        style={{ width: `${w}%` }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.15) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s linear infinite',
          }}
        />
      </div>
    ))}
  </div>
);

/* ── Main component ── */
const AIAnalysisCard = ({ analysis, geminiPowered, prediction }) => {
  const isFake = prediction === 'Fake';

  // Start typing only when we have text
  const { displayed, isDone } = useTypewriter(analysis || '', 16, !!analysis);

  const accentColor = isFake ? 'text-neon-red' : 'text-neon-green';
  const borderColor = isFake ? 'border-neon-red/20' : 'border-neon-green/20';
  const bgColor     = isFake ? 'bg-neon-red/5'     : 'bg-neon-green/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`rounded-2xl border ${borderColor} ${bgColor} overflow-hidden`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5
                      border-b border-white/8 bg-white/3">
        <div className="flex items-center gap-2.5">
          {/* Animated bot icon */}
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyber-500/30 to-neon-purple/30
                            border border-cyber-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyber-300" />
            </div>
            {/* Pulse ring */}
            {!isDone && (
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute inset-0 rounded-xl border border-cyber-400/40"
              />
            )}
          </div>

          <div>
            <p className="text-white font-semibold text-sm leading-none">AI Forensic Analysis</p>
            <p className="text-dark-700 text-[10px] mt-0.5 font-mono">
              {isDone ? 'Analysis complete' : 'Generating explanation…'}
            </p>
          </div>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-1.5">
          {geminiPowered ? (
            <span className="badge-cyan text-[10px] gap-1">
              <Sparkles className="w-3 h-3" />
              Gemini AI
            </span>
          ) : (
            <span className="badge text-[10px] bg-white/5 border-white/15 text-dark-700 gap-1">
              <Cpu className="w-3 h-3" />
              Static
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-4">
        <AnimatePresence mode="wait">
          {!analysis ? (
            /* Loading skeleton */
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkeletonLines />
            </motion.div>
          ) : (
            /* Typed text */
            <motion.div
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-dark-800 text-sm leading-relaxed">
                {displayed}
                <Cursor isDone={isDone} />
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      {isDone && analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 px-5 py-3 border-t border-white/8 bg-white/2"
        >
          {geminiPowered ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-neon-green shrink-0" />
              <span className="text-dark-600 text-[10px] font-mono">
                Generated by Google Gemini · For reference only
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500/70 shrink-0" />
              <span className="text-dark-600 text-[10px] font-mono">
                Static explanation · Add GEMINI_API_KEY for AI-generated analysis
              </span>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AIAnalysisCard;
