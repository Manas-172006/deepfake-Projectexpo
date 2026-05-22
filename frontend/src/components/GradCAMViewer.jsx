/**
 * GradCAMViewer — FakeProof Labs
 * Premium forensic neural attention visualization.
 * Displays original image, Grad-CAM heatmap, and blended overlay
 * side-by-side with animated reveal and AI attention score.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Layers, Eye, Blend, Activity, Info, ZoomIn } from 'lucide-react';

/* ── Attention score interpretation ── */
const getAttentionLabel = (score, isFake) => {
  if (score === null || score === undefined) return { label: 'N/A', color: 'text-[#8888bb]' };
  if (isFake) {
    if (score >= 75) return { label: 'High Synthetic Artifact Focus',      color: 'text-neon-red'   };
    if (score >= 45) return { label: 'Moderate Manipulation Evidence',     color: 'text-yellow-400' };
    return              { label: 'Low Manipulation Indicators',            color: 'text-[#8888bb]'  };
  } else {
    if (score >= 75) return { label: 'Strong Authenticity Indicators',     color: 'text-neon-green' };
    if (score >= 45) return { label: 'Moderate Authenticity Confidence',   color: 'text-cyber-400'  };
    return              { label: 'Diffuse Attention — Low Artifact Focus', color: 'text-[#8888bb]'  };
  }
};

/* ── Single image panel ── */
const ImagePanel = ({ label, sublabel, src, isActive, onClick, icon: Icon, accentClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    onClick={onClick}
    className={`relative rounded-xl overflow-hidden cursor-pointer group
                border transition-all duration-300
                ${isActive
                  ? `border-cyber-400/60 shadow-cyber`
                  : 'border-white/10 hover:border-white/25'
                }`}
  >
    {/* Image */}
    <div className="relative aspect-square bg-[#0f0f1a] overflow-hidden">
      {src ? (
        <img
          src={`data:image/png;base64,${src}`}
          alt={label}
          className="w-full h-full object-cover transition-transform duration-500
                     group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10
                            flex items-center justify-center mx-auto">
              <Icon className="w-4 h-4 text-[#5a5a8a]" />
            </div>
            <p className="text-[#5a5a8a] text-xs font-mono">Unavailable</p>
          </div>
        </div>
      )}

      {/* Scan line overlay */}
      {src && (
        <div className="absolute inset-0 pointer-events-none opacity-30 scan-overlay" />
      )}

      {/* Corner brackets */}
      {src && ['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
        <div
          key={pos}
          className={`absolute ${pos} w-4 h-4 border-cyber-400/50
            ${pos.includes('top') && pos.includes('left')    ? 'border-t border-l' : ''}
            ${pos.includes('top') && pos.includes('right')   ? 'border-t border-r' : ''}
            ${pos.includes('bottom') && pos.includes('left')  ? 'border-b border-l' : ''}
            ${pos.includes('bottom') && pos.includes('right') ? 'border-b border-r' : ''}
          `}
        />
      ))}

      {/* Zoom hint */}
      {src && (
        <div className="absolute inset-0 flex items-center justify-center
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        bg-black/30">
          <ZoomIn className="w-6 h-6 text-white" />
        </div>
      )}
    </div>

    {/* Label bar */}
    <div className="px-3 py-2 bg-[#0f0f1a]/90 border-t border-white/8">
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3.5 h-3.5 shrink-0 ${accentClass}`} />
        <p className="text-white text-xs font-semibold truncate">{label}</p>
      </div>
      <p className="text-[#5a5a8a] text-[10px] font-mono mt-0.5 truncate">{sublabel}</p>
    </div>
  </motion.div>
);

/* ── Lightbox ── */
const Lightbox = ({ src, label, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      className="relative max-w-2xl w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={`data:image/png;base64,${src}`}
        alt={label}
        className="w-full rounded-2xl border border-white/20 shadow-glass"
      />
      <p className="text-center text-[#8888bb] text-xs font-mono mt-3">{label} — click outside to close</p>
    </motion.div>
  </motion.div>
);

/* ── Main component ── */
const GradCAMViewer = ({ result }) => {
  const {
    prediction,
    gradcam_score,
    heatmap_image,
    overlay_image,
    original_image,
  } = result;

  const [lightbox, setLightbox] = useState(null); // { src, label }
  const isFake = prediction === 'Fake';
  const attn   = getAttentionLabel(gradcam_score, isFake);

  const hasAnyImage = original_image || heatmap_image || overlay_image;

  if (!hasAnyImage) return null;

  const panels = [
    {
      label:       'Original Scan',
      sublabel:    'Input image — unmodified',
      src:         original_image,
      icon:        Eye,
      accentClass: 'text-cyber-400',
      delay:       0.05,
    },
    {
      label:       'Neural Attention Map',
      sublabel:    'Grad-CAM heatmap — jet colormap',
      src:         heatmap_image,
      icon:        Layers,
      accentClass: 'text-yellow-400',
      delay:       0.15,
    },
    {
      label:       'Artifact Detection Overlay',
      sublabel:    'Original + heatmap blend (α=0.45)',
      src:         overlay_image,
      icon:        Blend,
      accentClass: isFake ? 'text-neon-red' : 'text-neon-green',
      delay:       0.25,
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card border border-white/10 overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyber-500/15 border border-cyber-500/30
                            flex items-center justify-center">
              <Layers className="w-4 h-4 text-cyber-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Neural Explainability</p>
              <p className="text-[#8888bb] text-[10px] font-mono">Grad-CAM · Class Activation Mapping</p>
            </div>
          </div>

          {/* AI Attention Score */}
          {gradcam_score !== null && gradcam_score !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-right"
            >
              <div className="flex items-center gap-1.5 justify-end mb-0.5">
                <Activity className="w-3.5 h-3.5 text-cyber-400" />
                <span className="text-[#8888bb] text-[10px] font-mono uppercase tracking-wider">
                  AI Attention Score
                </span>
              </div>
              <div className="text-2xl font-black text-neon-cyan leading-none">
                {gradcam_score}
                <span className="text-sm text-[#8888bb]">/100</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Image grid ── */}
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3">
            {panels.map((p) => (
              <ImagePanel
                key={p.label}
                {...p}
                isActive={false}
                onClick={() => p.src && setLightbox({ src: p.src, label: p.label })}
              />
            ))}
          </div>

          {/* ── Attention interpretation ── */}
          {gradcam_score !== null && gradcam_score !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 space-y-3"
            >
              {/* Score bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8888bb] font-mono">Attention Intensity</span>
                  <span className={`font-bold font-mono ${attn.color}`}>{gradcam_score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      isFake
                        ? 'bg-gradient-to-r from-yellow-500 to-neon-red'
                        : 'bg-gradient-to-r from-cyber-500 to-neon-green'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${gradcam_score}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Interpretation label */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/8">
                <Activity className={`w-3.5 h-3.5 shrink-0 ${attn.color}`} />
                <span className={`text-xs font-semibold ${attn.color}`}>{attn.label}</span>
              </div>

              {/* Legend */}
              <div className="flex items-start gap-2 text-[10px] text-[#5a5a8a] font-mono">
                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                <span>
                  Warm colours (red/yellow) indicate regions of high neural attention.
                  Cool colours (blue/green) indicate low activation.
                  Grad-CAM highlights the features most influential to the classification.
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            src={lightbox.src}
            label={lightbox.label}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default GradCAMViewer;
