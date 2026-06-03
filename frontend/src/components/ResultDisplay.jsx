/**
 * ResultDisplay — FakeProof Labs
 * Verdict card + Gemini AI explanation + confidence meter + Grad-CAM viewer.
 */

import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, BarChart3, Info, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import AIAnalysisCard from './AIAnalysisCard';
import GradCAMViewer  from './GradCAMViewer';

/* ── helpers ── */
const getConfig = (prediction, confidence) => {
  const isFake = prediction === 'Fake';
  return {
    isFake,
    label:       isFake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC IMAGE',
    sublabel:    isFake
      ? 'This image shows signs of AI manipulation'
      : 'This image appears to be genuine',
    Icon:        isFake ? ShieldAlert : ShieldCheck,
    accent:      isFake ? '#ff3366' : '#00ff88',
    accentClass: isFake ? 'text-neon-red'      : 'text-neon-green',
    bgClass:     isFake ? 'bg-neon-red/[0.08]' : 'bg-neon-green/[0.08]',
    borderClass: isFake ? 'border-neon-red/30' : 'border-neon-green/30',
    barClass:    isFake
      ? 'bg-gradient-to-r from-red-600 to-[#ff3366]'
      : 'bg-gradient-to-r from-green-500 to-[#00ff88]',
    riskLabel:
      confidence >= 90
        ? (isFake ? 'Very High Risk'  : 'Very High Confidence')
        : confidence >= 70
          ? (isFake ? 'High Risk'     : 'High Confidence')
          : (isFake ? 'Moderate Risk' : 'Moderate Confidence'),
  };
};

/* ── animated counter ── */
const AnimatedNumber = ({ target }) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = target / 40;
    const id = setInterval(() => {
      current += step;
      if (current >= target) { setValue(target); clearInterval(id); }
      else setValue(Math.floor(current));
    }, 25);
    return () => clearInterval(id);
  }, [target]);
  return <>{value}</>;
};

/* ── component ── */
const ResultDisplay = ({ result }) => {
  const {
    prediction,
    confidence,
    processing_time,
    ai_analysis,
    gemini_powered,
    gradcam_score,
    heatmap_image,
    overlay_image,
    original_image,
  } = result;

  const cfg = getConfig(prediction, confidence);
  const { Icon } = cfg;

  const hasGradCAM = original_image || heatmap_image || overlay_image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mt-8 space-y-4"
    >
      {/* ── Main verdict card ── */}
      <div className={`relative rounded-2xl border p-6 overflow-hidden
                       ${cfg.bgClass} ${cfg.borderClass}`}>
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(ellipse at top right, ${cfg.accent}33 0%, transparent 60%)`,
          }}
        />

        <div className="relative flex items-start gap-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.15 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0
                        ${cfg.bgClass} border ${cfg.borderClass}`}
            style={{ boxShadow: `0 0 20px ${cfg.accent}33` }}
          >
            <Icon className={`w-7 h-7 ${cfg.accentClass}`} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <p className="text-[#8888bb] text-xs font-mono uppercase tracking-widest mb-1">
              FakeProof Labs · AI Verdict
            </p>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-2xl font-black tracking-tight ${cfg.accentClass}`}
            >
              {cfg.label}
            </motion.h2>
            <p className="text-[#8888bb] text-sm mt-1">{cfg.sublabel}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-right shrink-0"
          >
            <div className={`text-4xl font-black ${cfg.accentClass} leading-none`}>
              <AnimatedNumber target={confidence} />
              <span className="text-2xl">%</span>
            </div>
            <p className="text-[#8888bb] text-xs mt-1">confidence</p>
          </motion.div>
        </div>
      </div>

      {/* ── Grad-CAM visualization ── */}
      {hasGradCAM && (
        <GradCAMViewer result={result} />
      )}

      {/* ── Gemini AI explanation ── */}
      <AIAnalysisCard
        analysis={ai_analysis}
        geminiPowered={gemini_powered}
        prediction={prediction}
      />

      {/* ── Confidence meter ── */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-[#b0b0d0] font-medium">
            <BarChart3 className="w-4 h-4 text-cyber-400" />
            Confidence Score
          </div>
          <span className={`font-bold font-mono ${cfg.accentClass}`}>{confidence}%</span>
        </div>

        <div className="progress-bar">
          <motion.div
            className={`progress-fill ${cfg.barClass}`}
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </div>

        <div className="flex justify-between text-xs text-[#5a5a8a] font-mono">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* ── Analysis breakdown ── */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 text-[#b0b0d0] font-medium text-sm mb-4">
          <TrendingUp className="w-4 h-4 text-cyber-400" />
          Analysis Breakdown
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Prediction',     value: prediction,                                    mono: false },
            { label: 'Confidence',     value: `${confidence}%`,                              mono: true  },
            { label: 'Risk Level',     value: cfg.riskLabel,                                 mono: false },
            { label: 'Inference',      value: processing_time ? `${processing_time} ms` : '—', mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 text-center border border-white/[0.08]">
              <p className="text-[#5a5a8a] text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-white font-bold text-sm ${mono ? 'font-mono' : ''}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Grad-CAM score row */}
        {gradcam_score !== null && gradcam_score !== undefined && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/[0.08]">
              <p className="text-[#5a5a8a] text-xs uppercase tracking-wider mb-1">Attention Score</p>
              <p className="text-neon-cyan font-bold text-sm font-mono">{gradcam_score}/100</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/[0.08]">
              <p className="text-[#5a5a8a] text-xs uppercase tracking-wider mb-1">XAI Method</p>
              <p className="text-cyber-300 font-bold text-sm">Grad-CAM</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl
                      bg-white/[0.03] border border-white/[0.08] text-[#5a5a8a] text-xs">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyber-500/60" />
        <span>
          Results are generated by FakeProof Labs AI systems. Use as a reference only —
          results may vary based on image quality and compression.
          Grad-CAM visualizations show neural attention, not definitive proof of manipulation.
        </span>
      </div>
    </motion.div>
  );
};

export default ResultDisplay;
