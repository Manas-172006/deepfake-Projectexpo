import { motion } from 'framer-motion';
import { UploadCloud, Cpu, Layers, FileDown, ShieldCheck, HelpCircle } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: UploadCloud,
    title: 'Upload Media',
    desc: 'Submit a digital image file (JPEG, PNG, WebP) or capture a live frame directly using your webcam secure feed.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    glow: 'rgba(6, 182, 212, 0.15)',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'AI Analysis',
    desc: 'The Convolutional Neural Network (CNN) runs deep feature scans, analyzing texture gradients and frequency anomalies.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    glow: 'rgba(124, 58, 237, 0.15)',
  },
  {
    step: '03',
    icon: Layers,
    title: 'XAI Heatmap',
    desc: 'Grad-CAM computes activation gradients in the final conv layers, generating a live neural attention heatmap.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    glow: 'rgba(234, 179, 8, 0.15)',
  },
  {
    step: '04',
    icon: FileDown,
    title: 'Report Export',
    desc: 'Generate a complete, high-fidelity PDF forensic report including verdict, Grad-CAM overlays, and timestamp.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    glow: 'rgba(34, 197, 94, 0.15)',
  },
];

const HowItWorks = () => {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section id="how-it-works" className="relative py-28 px-6 overflow-hidden border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <span className="badge bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 gap-1.5 py-1 px-3">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            Process Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How FakeProof <span className="gradient-text">Works</span>
          </h2>
          <p className="text-[#8888bb] text-sm leading-relaxed">
            A secure four-stage digital forensics pipeline designed to scan, verify, explain, and document media authenticity.
          </p>
        </div>

        {/* 4-Step Cards Layout */}
        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            return (
              <motion.div 
                key={s.step}
                variants={cardVariants}
                className="glass-card border-glow p-6 rounded-2xl relative flex flex-col justify-between group hover:scale-[1.03] transition-all duration-300"
                style={{ 
                  boxShadow: `0 8px 30px rgba(0, 0, 0, 0.4), inset 0 0 2px rgba(255, 255, 255, 0.05)` 
                }}
              >
                {/* Glowing Aura Effect */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at 10% 10%, ${s.glow} 0%, transparent 60%)`
                  }}
                />

                <div className="space-y-4 relative z-10">
                  {/* Step Header */}
                  <div className="flex justify-between items-center">
                    <div className={`w-12 h-12 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <span className="text-forensic-xs opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                      STEP {s.step}
                    </span>
                  </div>

                  {/* Step Body */}
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-base group-hover:text-cyan-300 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-[#8888bb] text-xs leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                {/* Connecting Lines between steps (for large screens) */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-12 -right-3.5 w-7 h-0.5 border-t border-dashed border-white/10 z-0 pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom trust banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-14 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Enterprise-Grade Security Sandbox</p>
              <p className="text-[#8888bb] text-xs">All image scans are processed locally or in memory. Media uploads are not stored persistently.</p>
            </div>
          </div>
          <span className="badge bg-white/5 border border-white/10 text-white text-[10px] uppercase font-mono px-3 py-1 shrink-0">
            Compliant Pipeline
          </span>
        </motion.div>

      </div>
    </section>
  );
};

export default HowItWorks;
