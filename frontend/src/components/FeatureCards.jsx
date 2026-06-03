/**
 * FeatureCards — three info cards below the analysis panel
 */

import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Lock } from 'lucide-react';

const cards = [
  {
    icon:  Zap,
    title: 'Sub-second Analysis',
    desc:  'Optimized CNN inference pipeline delivers results in under one second.',
    color: 'text-yellow-400',
    bg:    'bg-yellow-400/8',
    border:'border-yellow-400/20',
  },
  {
    icon:  ShieldCheck,
    title: 'High Accuracy',
    desc:  'Trained on thousands of real and AI-generated images for reliable detection.',
    color: 'text-neon-green',
    bg:    'bg-neon-green/8',
    border:'border-neon-green/20',
  },
  {
    icon:  Lock,
    title: 'Privacy First',
    desc:  'Images are processed in memory and never stored on our servers.',
    color: 'text-cyber-400',
    bg:    'bg-cyber-500/8',
    border:'border-cyber-500/20',
  },
];

const FeatureCards = () => (
  <section className="max-w-2xl mx-auto px-6 pb-16">
    <div className="grid sm:grid-cols-3 gap-4">
      {cards.map(({ icon: Icon, title, desc, color, bg, border }, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className={`glass-card p-5 border ${border}
                      hover:scale-[1.02] transition-transform duration-300 cursor-default`}
        >
          <div className={`w-10 h-10 rounded-xl ${bg} border ${border}
                           flex items-center justify-center mb-4`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <h3 className="text-white font-semibold text-sm mb-1.5">{title}</h3>
          <p className="text-dark-700 text-xs leading-relaxed">{desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default FeatureCards;
