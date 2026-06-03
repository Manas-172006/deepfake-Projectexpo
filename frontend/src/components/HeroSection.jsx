import { motion } from 'framer-motion';
import { Scan, Camera, Brain, Eye, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const HeroSection = () => {
  const handleScrollToDetector = (webcam = false) => {
    const element = document.getElementById('detector-workspace');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (webcam) {
        // Dispatch custom event to trigger Webcam modal in Detector Workspace
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('trigger-webcam-modal'));
        }, 800);
      }
    }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section id="home" className="relative min-h-[100vh] flex items-center justify-center pt-28 pb-24 px-6 overflow-hidden">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#03030d] via-transparent to-[#03030d]/50 pointer-events-none" />

      {/* Floating Radial Ambient Light */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] max-w-[800px] aspect-square rounded-full bg-purple-600/[0.04] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[350px] aspect-square rounded-full bg-cyan-500/[0.03] blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Column - Headline Content */}
        <motion.div 
          className="lg:col-span-7 text-left space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex">
            <span className="badge bg-purple-500/10 border border-purple-500/20 text-purple-300 gap-1.5 py-1 px-3">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              CNN Forensics & Explainable AI Platform
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]"
          >
            Detect Deepfakes <br />
            with <span className="gradient-text text-glow">Explainable AI</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-[#8888bb] text-base sm:text-lg max-w-xl leading-relaxed"
          >
            Analyze image authenticity using deep convolutional neural networks, 
            Grad-CAM activation visualizations, and automated forensic explanations powered by advanced AI.
          </motion.p>

          {/* Highlights Checklist */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 gap-x-4 gap-y-2.5 max-w-md pt-2"
          >
            {[
              'CNN Authenticity Scan',
              'Grad-CAM Explainability',
              'Real-Time Camera Scan',
              'PDF Forensics Report',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2 text-dark-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-4 pt-4"
          >
            <button
              onClick={() => handleScrollToDetector(false)}
              className="btn-cyber px-8 py-4 text-base font-bold flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-cyber-500 to-purple-600 rounded-xl shadow-cyber hover:shadow-cyber-lg"
            >
              <Scan className="w-5 h-5" />
              Upload Image
            </button>
            <button
              onClick={() => handleScrollToDetector(true)}
              className="btn-ghost px-8 py-4 text-base font-bold flex items-center gap-2 hover:bg-white/5 border border-white/10 rounded-xl"
            >
              <Camera className="w-5 h-5 text-purple-400" />
              Use Webcam
            </button>
          </motion.div>
        </motion.div>

        {/* Right Column - Premium Visual & Stats Grid */}
        <motion.div 
          className="lg:col-span-5 flex flex-col justify-center space-y-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Tech stack visualization art */}
          <div className="relative glass-card border-glow p-6 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            
            {/* Holographic scanner aesthetic */}
            <div className="relative aspect-video rounded-xl bg-dark-100 border border-white/5 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 shadow-cyber animate-scan top-0" />
              
              <div className="text-center z-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-inner-glow">
                  <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <div className="font-mono text-[10px] text-cyan-300 tracking-wider">
                  CLASSIFIER SCANNING PIPELINE
                </div>
                <div className="flex gap-1.5 justify-center">
                  {['224x224', 'RGB', 'ConvNet', 'XAI'].map((t) => (
                    <span key={t} className="text-[9px] font-mono bg-white/5 px-2 py-0.5 border border-white/10 text-[#8888bb] rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform capabilities */}
            <div className="space-y-2 mt-6 pt-6 border-t border-white/[0.05]">
              <p className="text-[10px] font-mono text-[#8888bb] font-bold uppercase tracking-wider">
                Core Capabilities
              </p>
              <ul className="grid grid-cols-2 gap-2">
                {[
                  '⚡ Real-time detection',
                  '🎯 Attention-based explainability',
                  '📱 Image & webcam input',
                  '📄 Automated PDF reports',
                ].map((item) => (
                  <li key={item} className="text-xs text-[#8888bb] flex items-start gap-2">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
