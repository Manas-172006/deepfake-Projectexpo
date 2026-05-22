/**
 * AnalysisPanel — central upload + analyze + result orchestrator.
 * Integrates: ForensicLoader, WebcamCapture, PDF export, and session counter.
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Scan, Download, Loader2 } from 'lucide-react';

import ImageUploader  from './ImageUploader';
import ForensicLoader from './ForensicLoader';
import ResultDisplay  from './ResultDisplay';
import WebcamCapture  from './WebcamCapture';
import { predictImage } from '../services/api';
import { generateForensicReport } from '../utils/pdfReport';
import { incrementAnalysisCount } from './MetricsDashboard';

const AnalysisPanel = ({ onAnalysisComplete }) => {
  const [selectedFile,  setSelectedFile]  = useState(null);
  const [previewUrl,    setPreviewUrl]    = useState(null); // for PDF
  const [isLoading,     setIsLoading]     = useState(false);
  const [result,        setResult]        = useState(null);
  const [error,         setError]         = useState(null);
  const [exporting,     setExporting]     = useState(false);

  /* Keep a ref to the preview data URL for PDF generation */
  const previewRef = useRef(null);

  const handleFileSelected = useCallback((file) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { previewRef.current = reader.result; };
      reader.readAsDataURL(file);
    } else {
      previewRef.current = null;
    }
  }, []);

  /* Webcam capture feeds directly into the same pipeline */
  const handleWebcamCapture = useCallback((file) => {
    handleFileSelected(file);
  }, [handleFileSelected]);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await predictImage(selectedFile);
      if (response.success) {
        setResult(response.data);
        incrementAnalysisCount();
        onAnalysisComplete?.();
      } else {
        // Surface the backend detail message directly — it's already human-readable
        setError(response.error || 'Analysis failed. Please try again.');
      }
    } catch {
      setError('Unexpected error. Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    previewRef.current = null;
  };

  const handleExportPDF = async () => {
    if (!result) return;
    setExporting(true);
    try {
      await generateForensicReport(result, previewRef.current);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const canAnalyze = selectedFile && !isLoading && !result;

  return (
    <section className="max-w-2xl mx-auto px-6 pb-24">
      <div className="glass-card border-glow p-6 sm:p-8 shadow-glass">

        {/* Panel header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.08]">
          <div className="w-8 h-8 rounded-lg bg-cyber-500/15 border border-cyber-500/30
                          flex items-center justify-center">
            <Scan className="w-4 h-4 text-cyber-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Forensic Analysis</h2>
            <p className="text-[#8888bb] text-xs">Upload or capture an image to begin detection</p>
          </div>
          <div className="ml-auto">
            <span className="badge-cyan text-[10px]">
              <Sparkles className="w-3 h-3" />
              FakeProof Labs
            </span>
          </div>
        </div>

        {/* Uploader */}
        <ImageUploader
          onImageSelect={handleFileSelected}
          isLoading={isLoading}
        />

        {/* Webcam + Analyze row */}
        <AnimatePresence>
          {canAnalyze && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-5 flex gap-3"
            >
              <WebcamCapture onCapture={handleWebcamCapture} disabled={isLoading} />
              <button
                onClick={handleAnalyze}
                className="btn-cyber flex-[2] py-4 text-base"
              >
                <Scan className="w-5 h-5" />
                Analyze Image
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Webcam button when no file selected */}
        <AnimatePresence>
          {!selectedFile && !isLoading && !result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex justify-center"
            >
              <WebcamCapture onCapture={handleWebcamCapture} disabled={false} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forensic loading experience */}
        <ForensicLoader isVisible={isLoading} />

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-xl overflow-hidden border border-neon-red/30 bg-neon-red/[0.06]"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-neon-red/20">
                <div className="w-5 h-5 rounded-full bg-neon-red/20 flex items-center justify-center shrink-0">
                  <span className="text-neon-red text-xs font-bold">!</span>
                </div>
                <p className="text-neon-red font-semibold text-sm">Analysis Failed</p>
              </div>
              {/* Body */}
              <div className="px-4 py-3">
                <p className="text-[#8888bb] text-xs leading-relaxed">{error}</p>
                {error.toLowerCase().includes('model') && (
                  <p className="text-[#5a5a8a] text-[11px] mt-2 font-mono">
                    Tip: Check the backend logs — the model file may be missing or invalid.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        {result && <ResultDisplay result={result} />}

        {/* Action buttons after result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 flex gap-3"
            >
              {/* Export PDF */}
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="btn-cyber flex-1 py-3 text-sm disabled:opacity-60"
              >
                {exporting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <><Download className="w-4 h-4" /> Export Report</>
                }
              </button>

              {/* Reset */}
              <button onClick={handleReset} className="btn-ghost flex-1 py-3 text-sm">
                <RotateCcw className="w-4 h-4" />
                New Analysis
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AnalysisPanel;
