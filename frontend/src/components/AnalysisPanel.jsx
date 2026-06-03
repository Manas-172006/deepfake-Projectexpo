import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, RotateCcw, CheckCircle2, Loader2, Sparkles, FolderArchive, ArrowRight, Server, Play } from 'lucide-react';

import ImageUploader from './ImageUploader';
import WebcamCapture from './WebcamCapture';
import ResultsDashboard from './ResultsDashboard';
import ReportGeneration from './ReportGeneration';

import { predictImage } from '../services/api';
import { runSandboxPrediction } from '../utils/sandboxPredict';
import { incrementAnalysisCount } from './MetricsDashboard';

const PIPELINE_STAGES = [
  { label: 'Upload Complete', percent: 15, details: 'Image tensors transferred to workspace memory.' },
  { label: 'Image Preprocessing', percent: 30, details: 'Rescaling to 224x224, normalising RGB vectors.' },
  { label: 'Feature Extraction', percent: 45, details: 'Computing local texture gradients and covariance maps.' },
  { label: 'CNN Inference', percent: 60, details: 'Forward pass through dense layers; classifying weights.' },
  { label: 'Confidence Estimation', percent: 75, details: 'Extracting classifier probability logits.' },
  { label: 'Grad-CAM Generation', percent: 90, details: 'Backpropagating gradients to compute attention maps.' },
  { label: 'Report Preparation', percent: 100, details: 'Packaging results, overlays, and timestamp.' },
];

const AnalysisPanel = ({ onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Sandbox notification inside loader
  const [loaderStatus, setLoaderStatus] = useState('Analulsing image...');

  // History state for "History / Archive" flow
  const [history, setHistory] = useState([]);

  // Ref to hold preview image
  const previewRef = useRef(null);

  // Catch custom event from Hero Section to trigger webcam capture
  useEffect(() => {
    const handleTriggerWebcam = () => {
      // Find and click the Webcam button
      const webcamButton = document.querySelector('[title="Capture from webcam"]');
      if (webcamButton) webcamButton.click();
    };
    window.addEventListener('trigger-webcam-modal', handleTriggerWebcam);
    return () => window.removeEventListener('trigger-webcam-modal', handleTriggerWebcam);
  }, []);

  const handleFileSelected = useCallback((file) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewRef.current = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      previewRef.current = null;
    }
  }, []);

  const handleWebcamCapture = useCallback((file) => {
    handleFileSelected(file);
  }, [handleFileSelected]);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setCurrentStage(0);
    setLoaderStatus('Routing to FastAPI server...');

    // We start the visual loader animation
    let loadingFinished = false;
    let apiData = null;

    // Trigger API request concurrently
    const apiPromise = (async () => {
      try {
        const response = await predictImage(selectedFile);
        if (response.success) {
          return response.data;
        } else {
          // If backend offline or degraded, engage sandbox mode fallback
          console.warn('FastAPI Offline. Falling back to sandbox simulation mode.');
          setLoaderStatus('FastAPI offline. Running local sandbox model...');
          const sandboxRes = await runSandboxPrediction(selectedFile, previewRef.current);
          return sandboxRes;
        }
      } catch (err) {
        // Fallback
        const sandboxRes = await runSandboxPrediction(selectedFile, previewRef.current);
        return sandboxRes;
      }
    })();

    // Loading stages animation controller
    const totalDuration = 4000; // 4 seconds min to feel powerful
    const intervalTime = 50;
    const progressStep = 100 / (totalDuration / intervalTime);

    const animationInterval = setInterval(async () => {
      setProgress((prev) => {
        const nextProgress = prev + progressStep;
        
        // Match progress to checklist stages
        const stageIndex = PIPELINE_STAGES.findIndex(s => nextProgress < s.percent);
        if (stageIndex !== -1) {
          setCurrentStage(stageIndex);
        } else {
          setCurrentStage(PIPELINE_STAGES.length - 1);
        }

        if (nextProgress >= 95) {
          // Pause at 95% until API promise resolves
          if (apiData) {
            clearInterval(animationInterval);
            setProgress(100);
            setTimeout(() => {
              finalizeAnalysis(apiData);
            }, 400);
            return 100;
          }
          return 95;
        }
        return nextProgress;
      });
    }, intervalTime);

    // Wait for API promise
    try {
      apiData = await apiPromise;
    } catch (err) {
      clearInterval(animationInterval);
      setIsLoading(false);
      setError('An error occurred during computational extraction.');
    }
  };

  const finalizeAnalysis = (data) => {
    setResult(data);
    setIsLoading(false);
    incrementAnalysisCount();
    onAnalysisComplete?.();

    // Add to history
    setHistory((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verdict: data.prediction,
        confidence: data.confidence,
        thumbnail: previewRef.current,
        rawResult: data
      },
      ...prev
    ]);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    previewRef.current = null;
  };

  const handleSelectHistory = (historyItem) => {
    // Restore result from archive selection
    previewRef.current = historyItem.thumbnail;
    setResult(historyItem.rawResult);
    // Set file input preview representation
    // To keep it simple, we reuse the thumbnail
    setSelectedFile(new File([], `archived_scan_${historyItem.id}.jpg`));
    
    // Smooth scroll to detector workspace header
    const element = document.getElementById('detector-workspace');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const canAnalyze = selectedFile && !isLoading && !result;

  return (
    <section id="detector-workspace" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card border-glow p-8 sm:p-12 shadow-glass relative">
          
          {/* Workspace header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Scan className="w-4.5 h-4.5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Forensic Detector Workspace</h2>
            <p className="text-[#8888bb] text-xs">Upload media and run deep learning authenticity filters</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="badge-cyan text-[10px] gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              FPL Classifier v2.0
            </span>
          </div>
        </div>

        {/* WORKSPACE FLOW STATE MACHINE */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            /* STAGE 2: AI Processing Immersive Loader */
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="py-12 flex flex-col items-center justify-center space-y-8"
            >
              {/* Spinning Scanner Circle */}
              <div className="relative w-24 h-24">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-purple-500/40"
                />
                <div className="absolute inset-2 rounded-full border border-dashed border-white/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              </div>

              {/* Status information */}
              <div className="text-center space-y-2 max-w-sm w-full">
                <h4 className="text-white font-bold text-sm">Running Forensic Pipeline...</h4>
                <p className="text-[#8888bb] font-mono text-[10px] uppercase tracking-wider">{loaderStatus}</p>
                
                {/* Progress bar and percentage */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#8888bb]">
                    <span>Pipeline Progress</span>
                    <span className="font-bold text-white">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 border border-white/5 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-[#7c3aed]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Checklist details */}
              <div className="w-full max-w-md rounded-xl bg-white/[0.01] border border-white/[0.05] p-5 space-y-3 font-mono text-xs">
                <p className="text-[#5a5a8a] text-[9px] tracking-widest uppercase mb-1">
                  ── Forensics Logs ──
                </p>
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isDone = progress >= stage.percent;
                  const isActive = currentStage === idx && !isDone;
                  
                  return (
                    <div
                      key={stage.label}
                      className={`flex items-start gap-3 transition-colors duration-300 ${
                        isDone ? 'text-neon-green' : isActive ? 'text-cyan-300' : 'text-[#5a5a8a]'
                      }`}
                    >
                      <span className="w-4 text-center shrink-0">
                        {isDone ? '✓' : isActive ? '▶' : '○'}
                      </span>
                      <div className="flex-1">
                        <span className="font-bold">{stage.label}</span>
                        {isActive && (
                          <p className="text-[10px] text-[#8888bb] mt-0.5 leading-normal">
                            {stage.details}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : result ? (
            /* STAGE 3: Results Dashboard + Report Generation */
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Dynamic Dashboard */}
              <ResultsDashboard result={result} />

              {/* PDF & Share Stage */}
              <ReportGeneration result={result} previewUrl={previewRef.current} />

              {/* Reset trigger */}
              <div className="flex justify-end pt-6 border-t border-white/[0.05]">
                <button
                  onClick={handleReset}
                  className="btn-ghost py-3 px-6 text-sm gap-2 font-bold hover:bg-white/5 border border-white/10"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Analysis
                </button>
              </div>
            </motion.div>
          ) : (
            /* STAGE 1: Standard Drag-Drop & Webcam view */
            <motion.div
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Uploader Dropzone */}
              <ImageUploader onImageSelect={handleFileSelected} isLoading={false} />

              {/* Webcam action trigger row */}
              <div className="flex gap-4">
                <WebcamCapture onCapture={handleWebcamCapture} disabled={false} />
                
                {selectedFile && (
                  <button
                    onClick={handleAnalyze}
                    className="btn-cyber py-3 flex-[2] font-bold text-sm"
                  >
                    <Play className="w-4 h-4 fill-white shrink-0" />
                    Run Authenticity Scan
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ERROR DISPLAY */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-semibold"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STAGE 4: History / Archive list (renders at the bottom of panel) */}
        {history.length > 0 && !isLoading && (
          <div className="mt-12 pt-8 border-t border-white/[0.06] space-y-4">
            <div className="flex items-center gap-2 text-[#b0b0d0]">
              <FolderArchive className="w-4.5 h-4.5 text-cyan-400" />
              <h3 className="text-white font-bold text-sm">Scan Registry History</h3>
              <span className="text-[10px] font-mono text-[#5a5a8a]">({history.length} archived scans)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {history.map((item) => {
                const isFakeItem = item.verdict === 'Fake';
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectHistory(item)}
                    className="group rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/20 p-2.5 cursor-pointer transition-all duration-300 flex flex-col gap-2 relative"
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/5 relative">
                      <img src={item.thumbnail} alt="History thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-cyan-400 transform translate-x-[-4px] group-hover:translate-x-0 transition-transform" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className={isFakeItem ? 'text-neon-red font-bold' : 'text-neon-green font-bold'}>
                        {item.verdict.toUpperCase()}
                      </span>
                      <span className="text-[#5a5a8a]">{item.timestamp}</span>
                    </div>

                    <div className="text-[9px] text-[#8888bb] font-mono truncate">
                      Conf: {item.confidence}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
      </div>
    </section>
  );
};

export default AnalysisPanel;
