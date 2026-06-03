/**
 * HowItWorks — interactive educational section explaining deepfakes and detection.
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Brain, Layers, ScanLine, ShieldCheck,
  ChevronDown, ChevronUp, Cpu, Eye, AlertTriangle,
} from 'lucide-react';

/* ── Expandable concept card ── */
const ConceptCard = ({ icon: Icon, title, summary, detail, color, bg, border, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`glass-card border ${border} overflow-hidden
                  hover:border-opacity-60 transition-all duration-300`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <div className={`w-10 h-10 rounded-xl ${bg} border ${border}
                         flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
          <p className="text-dark-700 text-xs leading-relaxed">{summary}</p>
        </div>
        <div className="shrink-0 mt-1">
          {open
            ? <ChevronUp  className="w-4 h-4 text-dark-600" />
            : <ChevronDown className="w-4 h-4 text-dark-600" />
          }
        </div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 pt-0">
          <div className={`h-px ${bg} mb-4 opacity-30`} />
          <p className="text-dark-800 text-xs leading-relaxed">{detail}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Pipeline step ── */
const PipelineStep = ({ step, label, desc, color, isLast }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full border-2 ${color} flex items-center justify-center
                       text-xs font-black text-white bg-dark-100 shrink-0`}>
        {step}
      </div>
      {!isLast && <div className="w-px flex-1 bg-white/10 mt-2" />}
    </div>
    <div className={`pb-6 ${isLast ? '' : ''}`}>
      <p className="text-white font-semibold text-sm mb-1">{label}</p>
      <p className="text-dark-700 text-xs leading-relaxed">{desc}</p>
    </div>
  </div>
);

const concepts = [
  {
    icon:    Brain,
    title:   'What are Deepfakes?',
    summary: 'AI-generated synthetic media that replaces or manipulates faces and voices.',
    detail:  'Deepfakes are created using deep learning models — primarily Generative Adversarial Networks (GANs) and diffusion models — that learn to synthesize photorealistic images of people. They can swap faces, alter expressions, or generate entirely fictional individuals. While they have legitimate creative uses, they pose serious risks for misinformation, fraud, and identity theft.',
    color:   'text-neon-red',
    bg:      'bg-neon-red/8',
    border:  'border-neon-red/20',
  },
  {
    icon:    Layers,
    title:   'How GANs Generate Fake Images',
    summary: 'Two competing neural networks — a generator and a discriminator — train each other.',
    detail:  'A GAN consists of two networks: a Generator that creates synthetic images, and a Discriminator that tries to distinguish real from fake. They compete in a zero-sum game — the generator improves at fooling the discriminator, while the discriminator improves at detecting fakes. After millions of training iterations, the generator produces images indistinguishable to the human eye, but subtle statistical artifacts remain in pixel distributions and frequency domains.',
    color:   'text-neon-purple',
    bg:      'bg-purple-500/8',
    border:  'border-purple-500/20',
  },
  {
    icon:    AlertTriangle,
    title:   'Artifacts in Synthetic Media',
    summary: 'AI-generated images leave detectable statistical fingerprints.',
    detail:  'Despite their visual realism, AI-generated images contain subtle artifacts: irregular texture gradients, unnatural frequency distributions in the DCT domain, inconsistent noise patterns, and synthetic smoothing around facial boundaries. These artifacts are invisible to humans but detectable by trained convolutional neural networks that learn to identify the statistical signatures of GAN-generated content.',
    color:   'text-yellow-400',
    bg:      'bg-yellow-400/8',
    border:  'border-yellow-400/20',
  },
  {
    icon:    Eye,
    title:   'How Our CNN Detects Deepfakes',
    summary: 'A convolutional neural network trained on real and synthetic image pairs.',
    detail:  'DeepGuard uses a CNN trained on over 140,000 real and AI-generated image pairs. The model learns hierarchical feature representations — from low-level texture patterns to high-level semantic inconsistencies. The final sigmoid output layer produces a probability score: values above 0.5 indicate synthetic origin. The model achieves 99.2% accuracy on held-out test data.',
    color:   'text-cyber-400',
    bg:      'bg-cyber-500/8',
    border:  'border-cyber-500/20',
  },
  {
    icon:    ShieldCheck,
    title:   'Why Detection Matters',
    summary: 'Deepfake detection is a critical tool for digital trust and media integrity.',
    detail:  'As synthetic media becomes indistinguishable from reality, automated detection tools become essential infrastructure for journalism, law enforcement, social media platforms, and individuals. Deepfake detection helps prevent non-consensual synthetic media, political disinformation, financial fraud, and identity theft — making it one of the most important applied AI problems of the decade.',
    color:   'text-neon-green',
    bg:      'bg-neon-green/8',
    border:  'border-neon-green/20',
  },
];

const pipeline = [
  { label: 'Image Upload',         desc: 'User submits a JPEG, PNG, or WebP image via drag-and-drop or file browser.',                                color: 'border-cyber-400'  },
  { label: 'Preprocessing',        desc: 'Image is resized to 224×224 pixels, converted to RGB, and normalized to [0,1] float range.',                color: 'border-cyber-400'  },
  { label: 'CNN Inference',        desc: 'The TensorFlow model runs a forward pass through convolutional, pooling, and dense layers.',                 color: 'border-neon-purple' },
  { label: 'Sigmoid Classification', desc: 'The output neuron produces a probability score. Values > 0.5 classify as Fake.',                          color: 'border-neon-purple' },
  { label: 'Gemini Explanation',   desc: 'The prediction and confidence are sent to Gemini AI, which generates a forensic analyst-style explanation.', color: 'border-neon-green'  },
  { label: 'Report Generation',    desc: 'Results are compiled into a structured forensic report with verdict, confidence, and AI analysis.',          color: 'border-neon-green'  },
];

const HowItWorks = () => (
  <section className="max-w-5xl mx-auto px-6 pb-20">
    {/* Section header */}
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-10"
    >
      <span className="badge-cyan mb-4 inline-flex">
        <Brain className="w-3.5 h-3.5" />
        Education
      </span>
      <h2 className="text-3xl font-black text-white mb-3">
        How It <span className="gradient-text">Works</span>
      </h2>
      <p className="text-dark-700 text-sm max-w-xl mx-auto">
        Understanding deepfakes, synthetic media, and how AI-powered detection works.
      </p>
    </motion.div>

    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left: concept cards */}
      <div className="space-y-3">
        <p className="text-dark-600 text-xs font-mono uppercase tracking-widest mb-4">
          Core Concepts
        </p>
        {concepts.map((c, i) => (
          <ConceptCard key={c.title} {...c} index={i} />
        ))}
      </div>

      {/* Right: detection pipeline */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-dark-600 text-xs font-mono uppercase tracking-widest mb-4">
          Detection Pipeline
        </p>
        <div className="glass-card p-6 border border-white/10">
          {pipeline.map((step, i) => (
            <PipelineStep
              key={step.label}
              step={i + 1}
              label={step.label}
              desc={step.desc}
              color={step.color}
              isLast={i === pipeline.length - 1}
            />
          ))}
        </div>

        {/* Architecture badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex flex-wrap gap-2"
        >
          {['TensorFlow 2.13', 'Keras CNN', 'Sigmoid Output', 'FastAPI', 'Gemini 1.5 Flash'].map((tag) => (
            <span key={tag} className="badge-cyan text-[10px]">{tag}</span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default HowItWorks;
