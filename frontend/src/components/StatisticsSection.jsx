import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ShieldCheck, ShieldAlert, FileText, Database } from 'lucide-react';

const CountUp = ({ end, duration = 1800, decimals = 0, suffix = '' }) => {
  const [value, setValue] = useState(0);
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = end / (duration / 16); // ~60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start * 10) / 10); // Preserve decimals
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, isVisible]);

  return (
    <span ref={elementRef}>
      {decimals > 0 ? value.toFixed(decimals) : Math.floor(value)}{suffix}
    </span>
  );
};

const StatisticsSection = () => {
  const stats = [
    {
      icon: ShieldCheck,
      label: 'Model Accuracy',
      value: 94.7,
      suffix: '%',
      decimals: 1,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      subtitle: 'Overall classification accuracy on test set',
    },
    {
      icon: Database,
      label: 'Precision Score',
      value: 92.3,
      suffix: '%',
      decimals: 1,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      subtitle: 'Accuracy of positive predictions',
    },
    {
      icon: ShieldAlert,
      label: 'Recall Score',
      value: 96.1,
      suffix: '%',
      decimals: 1,
      color: 'text-red-400',
      bg: 'bg-neon-red/10',
      border: 'border-neon-red/20',
      subtitle: 'Coverage of actual positives',
    },
    {
      icon: FileText,
      label: 'F1 Score',
      value: 94.2,
      suffix: '%',
      decimals: 1,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      subtitle: 'Harmonic mean of precision & recall',
    },
  ];

  return (
    <section id="statistics-section" className="relative py-32 px-6 overflow-hidden border-t border-white/[0.04]">
      {/* Background soft lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-cyan-600/[0.03] blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <span className="badge bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 gap-1.5 py-1 px-3">
            <BarChart3 className="w-3.5 h-3.5" />
            Model Performance
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Accuracy & <span className="gradient-text">Performance Metrics</span>
          </h2>
          <p className="text-[#8888bb] text-sm leading-relaxed">
            Deepfake detection model performance evaluated on a comprehensive test dataset.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, index) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.6 }}
                className="glass-card border-glow p-6 rounded-2xl text-center hover:scale-[1.02] transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mx-auto mb-5 shadow-inner-glow`}>
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div className="text-4xl font-black text-white leading-none font-mono tracking-tight mb-1">
                  <CountUp end={s.value} decimals={s.decimals} suffix={s.suffix} />
                </div>
                <p className="text-[#8888bb] text-xs font-semibold uppercase tracking-wider mb-2">
                  {s.label}
                </p>
                <p className="text-[10px] text-[#8888bb]/70 leading-snug">
                  {s.subtitle}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default StatisticsSection;
