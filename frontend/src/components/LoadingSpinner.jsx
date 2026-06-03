/**
 * LoadingSpinner — animated AI analysis state with step indicators
 */

import { motion } from 'framer-motion';
import { Brain, Cpu, ScanLine, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const steps = [
  { icon: ScanLine, label: 'Preprocessing image…'   },
  { icon: Brain,    label: 'Running neural network…' },
  { icon: Cpu,      label: 'Computing confidence…'   },
  { icon: CheckCircle2, label: 'Finalizing result…'  },
];

const LoadingSpinner = ({ message = 'Analyzing image…' }) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length);
    }, 900);
    return () => clearInterval(id);
  }, []);

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 space-y-8"
    >
      {/* Spinner rings */}
      <div className="relative w-24 h-24">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />

        {/* Spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-transparent
                     border-t-cyber-400 border-r-cyber-400/50"
        />

        {/* Counter-spinning ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border border-transparent
                     border-b-neon-purple/60"
        />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            key={stepIndex}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentIcon className="w-7 h-7 text-cyber-400" />
          </motion.div>
        </div>

        {/* Glow */}
        <div className="absolute inset-0 rounded-full"
             style={{ boxShadow: '0 0 30px rgba(0,212,255,0.2)' }} />
      </div>

      {/* Step label */}
      <div className="text-center space-y-2">
        <motion.p
          key={stepIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-cyber-300 font-semibold text-base"
        >
          {steps[stepIndex].label}
        </motion.p>
        <p className="text-dark-700 text-sm font-mono">{message}</p>
      </div>

      {/* Step dots */}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width:      i === stepIndex ? 20 : 6,
              background: i === stepIndex ? '#00d4ff' : 'rgba(255,255,255,0.15)',
            }}
            transition={{ duration: 0.3 }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;
