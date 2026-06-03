/**
 * HeroSection — FakeProof Labs
 */

import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Eye, Brain, Layers } from 'lucide-react';

const stats = [
  { value: '99.2%', label: 'Accuracy'     },
  { value: '<1s',   label: 'Inference'    },
  { value: 'CNN',   label: 'Architecture' },
  { value: 'Grad-CAM', label: 'XAI'      },
];

const features = [
  { icon: Brain,      label: 'Deep Learning'      },
  { icon: Eye,        label: 'Vision AI'           },
  { icon: Layers,     label: 'Grad-CAM Heatmaps'  },
  { icon: ShieldCheck,label: 'Authenticity Check'  },
  { icon: Zap,        label: 'Real-time Analysis'  },
];

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const HeroSection = () => (
  <section className="relative pt-20 pb-16 px-6 text-center overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    w-[600px] h-[600px] rounded-full border border-cyber-500/10 pointer-events-none" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    w-[400px] h-[400px] rounded-full border border-cyber-500/[0.08] pointer-events-none" />

    <motion.div className="max-w-4xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">

      <motion.div variants={itemVariants} className="flex justify-center mb-6">
        <span className="badge-cyan">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-400 animate-pulse" />
          AI-Powered · Grad-CAM Explainability · University Project Expo 2025
        </span>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05] mb-6"
      >
        Prove It's{' '}
        <span className="gradient-text">FakeProof.</span>
        <br />
        <span className="text-[#b0b0d0]">Instantly.</span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="text-[#8888bb] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
      >
        Upload any image and FakeProof Labs will run a full forensic analysis —
        CNN deepfake detection, Grad-CAM neural attention heatmaps, and
        AI-generated forensic explanation in under a second.
      </motion.p>

      <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-14">
        {features.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded-full
                       bg-white/5 border border-white/10 text-[#b0b0d0] text-sm
                       hover:border-cyber-500/40 hover:text-cyber-300
                       transition-all duration-300 cursor-default"
          >
            <Icon className="w-4 h-4 text-cyber-400" />
            {label}
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {stats.map(({ value, label }) => (
          <div key={label} className="glass-card p-4 hover:border-cyber-500/30 transition-all duration-300">
            <div className="text-2xl font-black text-neon-cyan mb-1">{value}</div>
            <div className="text-xs text-[#8888bb] font-medium uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  </section>
);

export default HeroSection;
