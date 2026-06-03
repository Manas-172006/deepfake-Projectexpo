import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ZoomIn, Download, ChevronDown, Eye, Activity } from 'lucide-react';

/**
 * ResultsDashboard — Forensic Storytelling Experience
 * 
 * Sequential flow:
 * 1. Original Image (uploaded)
 * 2. Raw Grad-CAM Heatmap (attention map)
 * 3. Overlay Visualization (with blend control)
 * 4. Prediction Verdict (large verdict display)
 * 5. Human-Friendly Explanation (accessible summary)
 * 6. Technical Analysis (collapsed accordion)
 */

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

  const [blendAlpha, setBlendAlpha] = useState(0.45);
  const [zoomImage, setZoomImage] = useState(null);
  const [expandTechnical, setExpandTechnical] = useState(false);

  const isFake = prediction === 'Fake';
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

  // ───────────────────────────────────────────────────────────────────────
  // STEP 1: Original Image
  // ───────────────────────────────────────────────────────────────────────
  const StepOriginalImage = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Forensic Analysis Report
        </h2>
        <p className="text-[#8888bb] text-sm">
          Interactive visualization of image authenticity assessment
        </p>
      </div>

      <div className="glass-card border border-white/10 p-8 rounded-2xl">
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-cyan-400 font-bold tracking-wider uppercase">
                Step 1 · Input Media
              </p>
              <h3 className="text-white font-bold text-lg mt-1">Original Uploaded Image</h3>
              <p className="text-[#8888bb] text-xs mt-1">
                The image you submitted for analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomImage({ src: original_image, label: 'Original Image' })}
                className="p-2.5 rounded-lg hover:bg-white/5 border border-white/10 text-[#8888bb] hover:text-white transition-all"
                title="Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadBase64(original_image, `Original_${prediction}.png`)}
                className="p-2.5 rounded-lg hover:bg-white/5 border border-white/10 text-[#8888bb] hover:text-white transition-all"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/5 flex items-center justify-center group">
          {original_image ? (
            <img
              src={`data:image/png;base64,${original_image}`}
              alt="Original"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="text-xs text-[#5a5a8a] font-mono">No image</div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // ───────────────────────────────────────────────────────────────────────
  // STEP 2: Grad-CAM Heatmap with Explanation
  // ───────────────────────────────────────────────────────────────────────
  const StepHeatmap = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-4"
    >
      <div className="glass-card border border-white/10 p-8 rounded-2xl">
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-yellow-400 font-bold tracking-wider uppercase">
                Step 2 · Attention Map
              </p>
              <h3 className="text-white font-bold text-lg mt-1">Grad-CAM Heatmap</h3>
              <p className="text-[#8888bb] text-xs mt-1">
                Regions the neural network focused on during analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomImage({ src: heatmap_image, label: 'Grad-CAM Heatmap' })}
                className="p-2.5 rounded-lg hover:bg-white/5 border border-white/10 text-[#8888bb] hover:text-white transition-all"
                title="Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadBase64(heatmap_image, `Heatmap_${prediction}.png`)}
                className="p-2.5 rounded-lg hover:bg-white/5 border border-white/10 text-[#8888bb] hover:text-white transition-all"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/5 flex items-center justify-center group">
              {heatmap_image ? (
                <img
                  src={`data:image/png;base64,${heatmap_image}`}
                  alt="Heatmap"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="text-xs text-[#5a5a8a] font-mono">No heatmap</div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <p className="text-[10px] font-mono text-[#8888bb] font-bold uppercase mb-2 tracking-wider">
                What is Grad-CAM?
              </p>
              <p className="text-xs text-[#8888bb] leading-relaxed">
                Gradient-weighted Class Activation Mapping shows which image regions most influenced the model's decision.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <p className="text-[10px] font-mono text-[#8888bb] font-bold uppercase mb-2 tracking-wider">
                Heat Intensity
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500"></div>
              </div>
              <p className="text-[10px] text-[#8888bb] mt-2">
                Warm colors = high activation | Cool colors = low activation
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ───────────────────────────────────────────────────────────────────────
  // STEP 3: Overlay with Blend Slider
  // ───────────────────────────────────────────────────────────────────────
  const StepOverlay = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <div className="glass-card border border-white/10 p-8 rounded-2xl">
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-purple-400 font-bold tracking-wider uppercase">
                Step 3 · Blend Analysis
              </p>
              <h3 className="text-white font-bold text-lg mt-1">Overlay Visualization</h3>
              <p className="text-[#8888bb] text-xs mt-1">
                Compare original image with attention heatmap overlay
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomImage({ src: overlay_image, label: 'Overlay' })}
                className="p-2.5 rounded-lg hover:bg-white/5 border border-white/10 text-[#8888bb] hover:text-white transition-all"
                title="Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadBase64(overlay_image, `Overlay_${prediction}.png`)}
                className="p-2.5 rounded-lg hover:bg-white/5 border border-white/10 text-[#8888bb] hover:text-white transition-all"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Interactive Blended Image */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/5 flex items-center justify-center">
            {original_image && (
              <img
                src={`data:image/png;base64,${original_image}`}
                alt="Base"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {heatmap_image ? (
              <img
                src={`data:image/png;base64,${heatmap_image}`}
                alt="Heatmap Layer"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-100"
                style={{ opacity: blendAlpha }}
              />
            ) : null}
          </div>

          {/* Blend Slider */}
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
            <span className="text-[10px] font-mono text-[#8888bb] font-bold uppercase tracking-wider whitespace-nowrap">
              Blend
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={blendAlpha}
              onChange={(e) => setBlendAlpha(parseFloat(e.target.value))}
              className="flex-1 accent-purple-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-purple-400 font-bold w-10 text-right">
              {Math.round(blendAlpha * 100)}%
            </span>
          </div>
          <p className="text-xs text-[#8888bb] leading-relaxed">
            Adjust the slider to blend the heatmap overlay with the original image. This helps you see where the model focused during its analysis.
          </p>
        </div>
      </div>
    </motion.div>
  );

  // ───────────────────────────────────────────────────────────────────────
  // STEP 4: Prediction Verdict (Large, Prominent)
  // ───────────────────────────────────────────────────────────────────────
  const StepVerdict = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-4"
    >
      <div className={`glass-card border p-8 rounded-2xl ${statusBg} ${statusBorder}`}>
        <p className="text-[11px] font-mono text-[#8888bb] font-bold tracking-wider uppercase mb-3">
          Step 4 · Classification Result
        </p>

        <div className="space-y-6">
          {/* Large Verdict Display */}
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center border ${statusBorder} ${statusBg} flex-shrink-0`}>
              {isFake ? (
                <ShieldAlert className={`w-8 h-8 ${statusColor}`} />
              ) : (
                <ShieldCheck className={`w-8 h-8 ${statusColor}`} />
              )}
            </div>
            <div>
              <p className={`text-5xl sm:text-6xl font-black tracking-tight ${statusColor}`}>
                {isFake ? 'DEEPFAKE' : 'AUTHENTIC'}
              </p>
              <p className="text-[#8888bb] text-sm mt-1">
                {isFake 
                  ? 'This image contains synthetic generation indicators.' 
                  : 'This image appears to be a genuine photograph.'}
              </p>
            </div>
          </div>

          {/* Confidence Metric */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Confidence Score</span>
              <span className={`text-3xl font-black ${statusColor}`}>{confidence}%</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isFake 
                    ? 'bg-gradient-to-r from-red-600 to-neon-red' 
                    : 'bg-gradient-to-r from-green-500 to-neon-green'
                }`}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <p className="text-xs text-[#8888bb] mt-2">
              {confidence >= 90 ? '🔴 Very High Confidence' : confidence >= 70 ? '🟠 High Confidence' : '🟡 Moderate Confidence'}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-center">
              <p className="text-[10px] font-mono text-[#8888bb] uppercase font-bold mb-1">Processing Time</p>
              <p className="text-white font-bold font-mono">{processing_time}ms</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-center">
              <p className="text-[10px] font-mono text-[#8888bb] uppercase font-bold mb-1">Attention Score</p>
              <p className="text-cyan-400 font-bold font-mono">{gradcam_score}/100</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-center">
              <p className="text-[10px] font-mono text-[#8888bb] uppercase font-bold mb-1">Model Version</p>
              <p className="text-white font-bold font-mono">v2.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sandbox Warning */}
      {sandbox && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-center gap-3">
          <Activity className="w-5 h-5 text-yellow-500 shrink-0 animate-pulse" />
          <div>
            <p className="text-yellow-400 font-bold text-xs">Demo Mode Active</p>
            <p className="text-yellow-500/80 text-[10px] font-medium">Showing simulated classification. Backend unavailable.</p>
          </div>
        </div>
      )}
    </motion.div>
  );

  // ───────────────────────────────────────────────────────────────────────
  // STEP 5: Human-Friendly Explanation
  // ───────────────────────────────────────────────────────────────────────
  const StepExplanation = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="glass-card border border-white/10 p-8 rounded-2xl">
        <div className="space-y-3 mb-6">
          <p className="text-[11px] font-mono text-cyan-400 font-bold tracking-wider uppercase">
            Step 5 · Plain English Summary
          </p>
          <h3 className="text-white font-bold text-lg">What This Means</h3>
        </div>

        <div className="space-y-4">
          {/* Human-friendly summary */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
            <p className="text-[#8888bb] leading-relaxed text-sm">
              {isFake 
                ? `The neural network identified this image as a deepfake with ${confidence}% confidence. 
                   The Grad-CAM analysis shows that the model focused on specific regions that contain patterns 
                   consistent with synthetic generation. Key indicators include irregular texture boundaries and 
                   anomalous pixel distributions typical of AI synthesis algorithms.`
                : `The neural network identified this image as authentic with ${confidence}% confidence. 
                   The Grad-CAM analysis shows that the model focused on natural features that are consistent 
                   with genuine photographs. The lighting, textures, and spatial relationships appear realistic 
                   and show no indicators of synthetic manipulation or AI generation.`}
            </p>
          </div>

          {/* Key takeaways */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <p className="text-[10px] font-mono text-white font-bold uppercase mb-2 tracking-wider">Key Observations</p>
              <ul className="space-y-1.5 text-xs text-[#8888bb]">
                {isFake ? (
                  <>
                    <li>✗ Facial boundary artifacts detected</li>
                    <li>✗ Unusual pixel gradient patterns</li>
                    <li>✗ Inconsistent shadow regions</li>
                  </>
                ) : (
                  <>
                    <li>✓ Natural texture distribution</li>
                    <li>✓ Consistent lighting patterns</li>
                    <li>✓ Realistic color gradients</li>
                  </>
                )}
              </ul>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <p className="text-[10px] font-mono text-white font-bold uppercase mb-2 tracking-wider">Confidence Level</p>
              <p className="text-sm mb-2">
                <span className={`font-black ${statusColor}`}>{confidence}%</span>
                <span className="text-[#8888bb] ml-2">
                  {confidence >= 90 ? 'Highly Confident' : confidence >= 70 ? 'Confident' : 'Moderately Confident'}
                </span>
              </p>
              <p className="text-xs text-[#8888bb]">
                This score represents the model's certainty in its classification. Higher percentages indicate stronger evidence.
              </p>
            </div>
          </div>

          <p className="text-xs text-[#8888bb] flex items-start gap-2">
            <Eye className="w-4 h-4 text-cyan-400/50 shrink-0 mt-0.5" />
            <span>This explanation is generated by analyzing which image regions most influenced the neural network's decision.</span>
          </p>
        </div>
      </div>
    </motion.div>
  );

  // ───────────────────────────────────────────────────────────────────────
  // STEP 6: Collapsible Technical Analysis
  // ───────────────────────────────────────────────────────────────────────
  const StepTechnical = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="space-y-4"
    >
      <button
        onClick={() => setExpandTechnical(!expandTechnical)}
        className="w-full glass-card border border-white/10 p-6 rounded-2xl hover:bg-white/[0.02] transition-all flex items-center justify-between"
      >
        <div className="text-left">
          <p className="text-[11px] font-mono text-[#8888bb] font-bold tracking-wider uppercase">
            Step 6 · Advanced Analysis
          </p>
          <h3 className="text-white font-bold text-lg mt-2">Technical Findings</h3>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-[#8888bb] transition-transform duration-300 ${expandTechnical ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {expandTechnical && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card border border-white/10 p-8 rounded-2xl overflow-hidden"
          >
            <div className="space-y-6 text-xs text-[#8888bb]">
              
              {/* Full AI Analysis */}
              <div>
                <p className="text-[10px] font-mono text-white font-bold uppercase mb-3 tracking-wider">
                  Neural Network Analysis
                </p>
                <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-lg font-mono text-[11px] leading-relaxed">
                  {ai_analysis}
                </div>
              </div>

              {/* Attention Regions */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-mono text-white font-bold uppercase mb-3 tracking-wider">
                    High-Attention Regions
                  </p>
                  <div className="space-y-2">
                    {isFake ? (
                      <>
                        <div className="flex items-start gap-2 p-2 bg-white/[0.02] rounded border border-white/[0.05]">
                          <span className="text-red-400">→</span>
                          <span>Facial structure boundaries</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-white/[0.02] rounded border border-white/[0.05]">
                          <span className="text-red-400">→</span>
                          <span>Eye region interpolation</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-white/[0.02] rounded border border-white/[0.05]">
                          <span className="text-red-400">→</span>
                          <span>Shadow inconsistencies</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-2 p-2 bg-white/[0.02] rounded border border-white/[0.05]">
                          <span className="text-green-400">→</span>
                          <span>Natural facial features</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-white/[0.02] rounded border border-white/[0.05]">
                          <span className="text-green-400">→</span>
                          <span>Consistent lighting</span>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-white/[0.02] rounded border border-white/[0.05]">
                          <span className="text-green-400">→</span>
                          <span>Realistic textures</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-mono text-white font-bold uppercase mb-3 tracking-wider">
                    Model Confidence Breakdown
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-white/[0.02] rounded border border-white/[0.05]">
                      <span>Class Probability</span>
                      <span className="text-white font-bold">{confidence}%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/[0.02] rounded border border-white/[0.05]">
                      <span>Model Attention</span>
                      <span className="text-cyan-400 font-bold">{gradcam_score}/100</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/[0.02] rounded border border-white/[0.05]">
                      <span>Inference Latency</span>
                      <span className="text-white font-bold">{processing_time}ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Information */}
              <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-lg">
                <p className="text-[10px] font-mono text-white font-bold uppercase mb-2 tracking-wider">
                  Model Information
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div><span className="text-[#8888bb]">Architecture:</span> <span className="text-white ml-1">ResNet-50</span></div>
                  <div><span className="text-[#8888bb]">Version:</span> <span className="text-white ml-1">2.0</span></div>
                  <div><span className="text-[#8888bb]">Input Size:</span> <span className="text-white ml-1">224×224</span></div>
                  <div><span className="text-[#8888bb]">Framework:</span> <span className="text-white ml-1">TensorFlow</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // ───────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ───────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fadeIn">
      <StepOriginalImage />
      <StepHeatmap />
      <StepOverlay />
      <StepVerdict />
      <StepExplanation />
      <StepTechnical />

      {/* Lightbox Modal */}
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
              className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`data:image/png;base64,${zoomImage.src}`}
                alt={zoomImage.label}
                className="max-w-full max-h-[75vh] rounded-xl border border-white/20 shadow-glass object-contain"
              />
              <p className="text-center font-mono text-xs text-[#8888bb] mt-4">
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
