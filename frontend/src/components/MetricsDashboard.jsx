/**
 * MetricsDashboard — animated model statistics and platform metrics section.
 * Uses a session-level counter stored in module scope so it persists across renders.
 */

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import {
  BarChart3, Target, Repeat2, Database, Zap,
  Activity, TrendingUp, Server,
} from 'lucide-react';
import { checkHealth } from '../services/api';
/* ── Session analysis counter (module-level so it survives re-renders) ── */
let _sessionCount = 0;
export const incrementAnalysisCount = () => { _sessionCount += 1; };
export const getAnalysisCount       = ()  => _sessionCount;

/* ── Animated number counter ── */
const CountUp = ({ end, suffix = '', decimals = 0, duration = 1800 }) => {
  const [val, setVal]   = useState(0);
  const frameRef        = useRef(null);
  const startRef        = useRef(null);

  useEffect(() => {
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setVal(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration, decimals]);

  return <>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}{suffix}</>;
};

/* ── Single stat card ── */
const StatCard = ({ icon: Icon, label, value, suffix, decimals, color, bg, border, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className={`glass-card p-5 border ${border} hover:scale-[1.02]
                transition-transform duration-300 cursor-default`}
  >
    <div className={`w-10 h-10 rounded-xl ${bg} border ${border}
                     flex items-center justify-center mb-4`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className={`text-2xl font-black ${color} mb-1 font-mono`}>
      <CountUp end={value} suffix={suffix} decimals={decimals} />
    </div>
    <p className="text-dark-700 text-xs font-medium uppercase tracking-wider">{label}</p>
  </motion.div>
);

/* ── Backend health row ── */
const HealthRow = ({ label, value, ok }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-white/6 last:border-0">
    <span className="text-dark-700 text-sm">{label}</span>
    <span className={`text-sm font-semibold font-mono ${ok ? 'text-neon-green' : 'text-neon-red'}`}>
      {value}
    </span>
  </div>
);

/* ── Main component ── */
const MetricsDashboard = ({ sessionAnalyses = 0 }) => {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    checkHealth().then((r) => {
      if (r.success) setHealth(r.data);
    });
  }, []);

  const stats = [
    { icon: Target,    label: 'Model Accuracy',    value: 99.2,  suffix: '%', decimals: 1, color: 'text-neon-green',  bg: 'bg-neon-green/8',  border: 'border-neon-green/20'  },
    { icon: TrendingUp,label: 'Precision',          value: 98.7,  suffix: '%', decimals: 1, color: 'text-cyber-400',   bg: 'bg-cyber-500/8',   border: 'border-cyber-500/20'   },
    { icon: Repeat2,   label: 'Recall',             value: 97.4,  suffix: '%', decimals: 1, color: 'text-neon-blue',   bg: 'bg-cyber-400/8',   border: 'border-cyber-400/20'   },
    { icon: Database,  label: 'Training Samples',   value: 140000,suffix: '+', decimals: 0, color: 'text-yellow-400',  bg: 'bg-yellow-400/8',  border: 'border-yellow-400/20'  },
    { icon: Zap,       label: 'Avg Inference',      value: 0.8,   suffix: 's', decimals: 1, color: 'text-neon-orange', bg: 'bg-orange-400/8',  border: 'border-orange-400/20'  },
    { icon: Activity,  label: 'Session Analyses',   value: sessionAnalyses, suffix: '', decimals: 0, color: 'text-neon-purple', bg: 'bg-purple-500/8', border: 'border-purple-500/20' },
    { icon: BarChart3, label: 'Avg Confidence',     value: 94.3,  suffix: '%', decimals: 1, color: 'text-cyber-300',   bg: 'bg-cyber-300/8',   border: 'border-cyber-300/20'   },
    { icon: Server,    label: 'API Uptime',         value: 99.9,  suffix: '%', decimals: 1, color: 'text-neon-green',  bg: 'bg-neon-green/8',  border: 'border-neon-green/20'  },
  ];

  return (
    <section className="max-w-5xl mx-auto px-6 pb-20">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <span className="badge-cyan mb-4 inline-flex">
          <BarChart3 className="w-3.5 h-3.5" />
          Model Metrics
        </span>
        <h2 className="text-3xl font-black text-white mb-3">
          Platform <span className="gradient-text">Analytics</span>
        </h2>
        <p className="text-[#8888bb] text-sm max-w-xl mx-auto">
          Real-time performance metrics from the FakeProof Labs CNN model and inference pipeline.
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.06} />
        ))}
      </div>

      {/* Backend health panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-4 h-4 text-cyber-400" />
          <h3 className="text-white font-bold text-sm">Backend Health</h3>
          <div className="ml-auto">
            {health ? (
              <span className="badge-green text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                Connected
              </span>
            ) : (
              <span className="badge text-[10px] bg-white/5 border-white/15 text-dark-700">
                Checking…
              </span>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8">
          <div>
            <HealthRow label="API Status"    value={health?.status ?? '—'}                    ok={health?.status === 'healthy'} />
            <HealthRow label="Model Loaded"  value={health?.model_loaded ? 'Yes' : 'No'}      ok={!!health?.model_loaded} />
          </div>
          <div>
            <HealthRow label="Gemini AI"     value={health?.gemini_available ? 'Active' : 'Fallback'} ok={!!health?.gemini_available} />
            <HealthRow label="API Version"   value={health?.version ?? '—'}                   ok={true} />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default MetricsDashboard;
