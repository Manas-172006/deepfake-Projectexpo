import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ZoomIn, Download, Layers, Activity, Cpu, Sliders, Eye } from 'lucide-react';

const ResultsDashboard = ({ result }) => {
  const {
    prediction,
    confidence,
    processing_time,
    ai_analysis,
    gradcam_score,
    heatmap_image,
    overlay_image,
    original_image,
    sandbox
  } = result;

  const [blendAlpha, setBlendAlpha] = useState(0.45); // default alpha blend
  const [zoomImage, setZoomImage] = useState(null); // { src, label }

  const isFake = prediction === 'Fake';
  
  // Design tokens based on verdict
  const statusColor = isFake ? 'text-neon-red' : 'text-neon-green';
  const statusBg = isFake ? 'bg-neon-red/5' : 'bg-neon-green/5';
  const statusBorder = isFake ? 'border-neon-red/20' : 'border-neon-green/20';
  const statusShadow = isFake ? 'shadow-neon-red' : 'shadow-neon-green';

  const downloadBase64 = (base64Data, filename) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sandbox Warning Banner */}
      {sandbox && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-center gap-3">
          <Activity className="w-5 h-5 text-yellow-500 shrink-0 animate-pulse" />
          <div>
            <p className="text-yellow-400 font-bold text-xs">Simulated Sandbox Pipeline Active</p>
            <p className="text-yellow-500/80 text-[10px] font-medium leading-normal">
              Showing programmatic canvas-generated model classification and localized feature gradients.
            </p>
          </div>
        </div>
      )}

      {/* TOP ROW: Original Scan vs Raw Heatmap vs Blended Overlay */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Original Image Card */}
        <div className="glass-card border-glow p-5 flex flex-col justify-between">
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase">
                Channel 01 · Input Media
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomImage({ src: original_image, label: 'Original Media Scan' })}
                  className="p-1.5 rounded-md hover:bg-white/5 border border-white/5 text-[#8888bb] hover:text-white transition-all"
                  title="Zoom Scan"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => downloadBase64(original_image, `Original_Scan_${prediction}.png`)}
                  className="p-1.5 rounded-md hover:bg-white/5 border border-white/5 text-[#8888bb] hover:text-white transition-all"
                  title="Download Scan"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="text-white font-bold text-sm">Original Image Scan</h3>
          </div>

          <div className="relative aspect-square rounded-xl overflow-hidden bg-dark-100 border border-white/5 flex items-center justify-center group">
            {original_image ? (
              <img
                src={`data:image/png;base64,${original_image}`}
                alt="Original Upload"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="text-xs text-[#5a5a8a] font-mono">No original scan preview</div>
            )}
            {/* Viewfinder corner brackets */}
            {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
              <div
                key={pos}
                className={`absolute ${pos} w-4 h-4 border-white/20
                  ${pos.includes('top') && pos.includes('left')    ? 'border-t border-l' : ''}
                  ${pos.includes('top') && pos.includes('right')   ? 'border-t border-r' : ''}
                  ${pos.includes('bottom') && pos.includes('left')  ? 'border-b border-l' : ''}
                  ${pos.includes('bottom') && pos.includes('right') ? 'border-b border-r' : ''}
                `}
              />
            ))}
            <div className="absolute top-3 left-3">
              <span className="badge bg-[#03030d]/80 border border-white/10 text-white font-mono text-[9px] py-0.5 px-2">
                ORIGINAL
              </span>
            </div>
          </div>
        </div>

        {/* Raw Heatmap Card */}
        <div className="glass-card border-glow p-5 flex flex-col justify-between">
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-yellow-400 font-bold tracking-wider uppercase">
                Channel 02 · Attention Map
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomImage({ src: heatmap_image, label: 'Raw Heatmap Map' })}
                  className="p-1.5 rounded-md hover:bg-white/5 border border-white/5 text-[#8888bb] hover:text-white transition-all"
                  title="Zoom Heatmap"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => downloadBase64(heatmap_image, `Raw_Heatmap_${prediction}.png`)}
                  className="p-1.5 rounded-md hover:bg-white/5 border border-white/5 text-[#8888bb] hover:text-white transition-all"
                  title="Download Heatmap"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="text-white font-bold text-sm">Grad-CAM Raw Heatmap</h3>
          </div>

          <div className="relative aspect-square rounded-xl overflow-hidden bg-dark-100 border border-white/5 flex items-center justify-center group">
            {heatmap_image ? (
              <img
                src={`data:image/png;base64,${heatmap_image}`}
                alt="Raw Heatmap"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="text-xs text-[#5a5a8a] font-mono">No heatmap preview</div>
            )}
            {/* Viewfinder corner brackets */}
            {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
              <div
                key={pos}
                className={`absolute ${pos} w-4 h-4 border-yellow-500/20
                  ${pos.includes('top') && pos.includes('left')    ? 'border-t border-l' : ''}
                  ${pos.includes('top') && pos.includes('right')   ? 'border-t border-r' : ''}
                  ${pos.includes('bottom') && pos.includes('left')  ? 'border-b border-l' : ''}
                  ${pos.includes('bottom') && pos.includes('right') ? 'border-b border-r' : ''}
                `}
              />
            ))}
            <div className="absolute top-3 left-3">
              <span className="badge bg-[#03030d]/80 border border-yellow-500/20 text-yellow-300 font-mono text-[9px] py-0.5 px-2">
                HEATMAP
              </span>
            </div>
          </div>
        </div>

        {/* Grad-CAM Blended Overlay Card with Opacity Blend Slider */}
        <div className="glass-card border-glow p-5 flex flex-col justify-between">
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-purple-400 font-bold tracking-wider uppercase">
                Channel 03 · Forensic Overlay
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomImage({ src: overlay_image, label: 'Grad-CAM Overlay Blend' })}
                  className="p-1.5 rounded-md hover:bg-white/5 border border-white/5 text-[#8888bb] hover:text-white transition-all"
                  title="Zoom Overlay"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => downloadBase64(overlay_image, `GradCAM_Overlay_${prediction}.png`)}
                  className="p-1.5 rounded-md hover:bg-white/5 border border-white/5 text-[#8888bb] hover:text-white transition-all"
                  title="Download Blended Map"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="text-white font-bold text-sm">Forensic Overlay Blend</h3>
          </div>

          {/* Interactive Blended Image Panel */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-dark-100 border border-white/5 flex items-center justify-center">
            {/* Base Layer: Original Image */}
            {original_image && (
              <img
                src={`data:image/png;base64,${original_image}`}
                alt="Base Original"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {/* Blended Layer: Heatmap with alpha blending */}
            {heatmap_image ? (
              <img
                src={`data:image/png;base64,${heatmap_image}`}
                alt="Heatmap Layer"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-100"
                style={{ opacity: blendAlpha }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-[#5a5a8a] font-mono bg-black/40">
                Overlay unavailable
              </div>
            )}

            {/* Viewfinder corner brackets */}
            {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
              <div
                key={pos}
                className={`absolute ${pos} w-4 h-4 border-purple-500/30
                  ${pos.includes('top') && pos.includes('left')    ? 'border-t border-l' : ''}
                  ${pos.includes('top') && pos.includes('right')   ? 'border-t border-r' : ''}
                  ${pos.includes('bottom') && pos.includes('left')  ? 'border-b border-l' : ''}
                  ${pos.includes('bottom') && pos.includes('right') ? 'border-b border-r' : ''}
                `}
              />
            ))}

            <div className="absolute top-3 left-3">
              <span className="badge bg-[#03030d]/80 border border-purple-500/20 text-purple-300 font-mono text-[9px] py-0.5 px-2">
                OVERLAY
              </span>
            </div>

            {/* Micro scan overlay */}
            <div className="absolute inset-0 pointer-events-none scan-overlay opacity-25" />
          </div>

          {/* Opacity Blend Control Bar */}
          <div className="mt-4 flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl">
            <Sliders className="w-3.5 h-3.5 text-[#8888bb] shrink-0" />
            <span className="text-[10px] font-mono text-[#8888bb] font-semibold uppercase tracking-wider shrink-0 select-none">
              Blend α
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={blendAlpha}
              onChange={(e) => setBlendAlpha(parseFloat(e.target.value))}
              className="flex-1 accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono text-purple-400 font-bold shrink-0 w-8 text-right">
              {Math.round(blendAlpha * 100)}%
            </span>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: Prediction Card & AI Analysis Section */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Prediction Card (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className={`glass-card border p-6 rounded-2xl ${statusBg} ${statusBorder} relative overflow-hidden`}>
            {/* Glow Aura */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: `radial-gradient(ellipse at bottom right, ${isFake ? '#ff3366' : '#00ff88'}33 0%, transparent 60%)`
              }}
            />

            <div className="relative space-y-5">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${statusBorder} ${statusBg}`}>
                  {isFake ? (
                    <ShieldAlert className={`w-5.5 h-5.5 ${statusColor}`} />
                  ) : (
                    <ShieldCheck className={`w-5.5 h-5.5 ${statusColor}`} />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#8888bb] tracking-wider uppercase block">
                    CNN Classification
                  </span>
                  <h4 className="text-white font-bold text-sm">Forensic Authenticity Status</h4>
                </div>
              </div>

              {/* Large verdict display */}
              <div className="py-2">
                <span className="text-[9px] font-mono text-[#8888bb] uppercase tracking-wider block mb-1">
                  Classifier Verdict
                </span>
                <div className={`text-3xl font-black tracking-tight uppercase leading-none ${statusColor} ${statusShadow}`}>
                  {isFake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC PHOTO'}
                </div>
                <p className="text-[#8888bb] text-xs mt-1 leading-normal">
                  {isFake 
                    ? 'This image contains computational artifacts typical of AI synthesis.' 
                    : 'No anomalous texture gradients or GAN artifact clusters detected.'}
                </p>
              </div>

              {/* Confidence progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8888bb] font-semibold">Classifier Confidence</span>
                  <span className={`font-mono font-bold ${statusColor}`}>{confidence}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`h-full rounded-full ${
                      isFake 
                        ? 'bg-gradient-to-r from-red-600 to-[#ff3366]' 
                        : 'bg-gradient-to-r from-green-500 to-[#00ff88]'
                    }`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>

              {/* Metric Breakdown Table */}
              <div className="pt-2 grid grid-cols-2 gap-3 text-xs border-t border-white/[0.05]">
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/[0.04] text-center">
                  <span className="text-[#8888bb] text-[10px] block uppercase font-mono mb-0.5">Inference Delay</span>
                  <span className="text-white font-bold font-mono">{processing_time}ms</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/[0.04] text-center">
                  <span className="text-[#8888bb] text-[10px] block uppercase font-mono mb-0.5">Model Version</span>
                  <span className="text-white font-bold font-mono">ResNet-V2.0</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/[0.04] text-center col-span-2">
                  <span className="text-[#8888bb] text-[10px] block uppercase font-mono mb-0.5">Attention Score</span>
                  <span className="text-cyan-400 font-bold font-mono">{gradcam_score}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Analysis Section (7 cols) */}
        <div className="md:col-span-7">
          <div className="glass-card border-glow p-6 rounded-2xl h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.05]">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Activity className="w-4.5 h-4.5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Forensic AI Analysis</h3>
                  <p className="text-[#8888bb] text-[10px] font-mono">Neural Explanation & Interpretation</p>
                </div>
              </div>

              {/* Structured report block */}
              <div className="space-y-4 text-xs leading-relaxed text-[#8888bb]">
                <div>
                  <span className="text-[10px] font-mono text-white font-bold block mb-1 uppercase">
                    Key Findings
                  </span>
                  <p className="text-white/80 font-medium">
                    {isFake 
                      ? 'Detected statistical anomalies in spatial pixel gradients and local covariance matrices. Upsampling noise flags GAN manipulation.'
                      : 'High-frequency spectral residuals are homogeneous across all color channels. Gradient vectors align with typical sensor signatures.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-white font-bold block mb-1 uppercase">
                      Confidence Interpretation
                    </span>
                    <p>
                      Confidence score at <strong className="text-white">{confidence}%</strong> is classified as{' '}
                      <strong className={statusColor}>
                        {confidence >= 90 ? 'Very High Risk' : confidence >= 70 ? 'High Risk' : 'Moderate Risk'}
                      </strong>.
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-white font-bold block mb-1 uppercase">
                      Suspicious Regions
                    </span>
                    <p>
                      {isFake 
                        ? 'Facial boundaries, interpolation borders, eye clusters, and secondary shadow structures.'
                        : 'No clusters of synthetic anomalies detected inside primary boundary areas.'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-white font-bold block mb-1 uppercase">
                    AI Observations & Summary
                  </span>
                  <p className="font-mono text-[11px] bg-white/[0.02] border border-white/[0.05] p-3 rounded-lg leading-relaxed text-[#b0b0d0]">
                    {ai_analysis}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/[0.05] text-[10px] text-[#5a5a8a] font-mono">
              <Eye className="w-3.5 h-3.5 text-cyan-500/50 shrink-0" />
              <span>
                Grad-CAM highlights regions of high gradient activations. These maps represent model attention weights.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* LIGHTBOX ZOOM MODAL */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setZoomImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`data:image/png;base64,${zoomImage.src}`}
                alt={zoomImage.label}
                className="max-w-full max-h-[75vh] rounded-xl border border-white/20 shadow-glass object-contain"
              />
              <p className="text-center font-mono text-xs text-[#8888bb] mt-4 select-none">
                {zoomImage.label} · click outside to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultsDashboard;
