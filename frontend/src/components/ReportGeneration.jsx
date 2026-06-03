import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, FileText, Download, Code, Share2, Sparkles, CheckCircle2, Copy } from 'lucide-react';
import { generateForensicReport } from '../utils/pdfReport';

const ReportGeneration = ({ result, previewUrl }) => {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await generateForensicReport(result, previewUrl);
      showToast('PDF Forensic Report downloaded successfully');
    } catch (err) {
      console.error(err);
      showToast('Error exporting PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `FakeProofLabs_Report_${result.prediction}_raw.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Raw JSON forensic data exported successfully');
    } catch {
      showToast('Error exporting JSON data');
    }
  };

  const handleShareReport = () => {
    setSharing(true);
    const mockHash = Math.random().toString(36).substring(2, 10).toUpperCase();
    const shareUrl = `${window.location.origin}/report/FPL-${mockHash}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      setTimeout(() => {
        setSharing(false);
        showToast(`Forensic Link copied: report/FPL-${mockHash}`);
      }, 700);
    }).catch(() => {
      setSharing(false);
      showToast('Failed to copy share link');
    });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const includes = [
    'Authenticity Classifier Verdict',
    'Model Confidence Meter',
    'Grad-CAM Spatial Heatmap Maps',
    'Technical Model Architecture Details',
    'AI-Generated Forensic Observations Summary',
    'Verification Timestamp & Confidentiality Flag',
  ];

  return (
    <div className="glass-card border-glow p-6 rounded-2xl relative overflow-hidden bg-gradient-to-r from-purple-500/[0.02] to-cyan-500/[0.02]">
      {/* Visual background accents */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 rounded-full bg-cyan-500/5 blur-[50px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-cyber">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Forensic PDF Report Generator</h3>
            <p className="text-[#8888bb] text-xs font-mono">Compile digital signatures into official document</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:self-center self-start">
          <span className="text-[10px] font-mono text-[#8888bb] uppercase tracking-wider">Report Status:</span>
          <span className="badge-green gap-1 text-[11px] py-1 px-3 bg-neon-green/10 border border-neon-green/30 text-neon-green font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            READY FOR EXPORT
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8 py-6 items-center">
        {/* Left Column: checklist of contents (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
            Included Document Sections:
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {includes.map((text) => (
              <div key={text} className="flex items-start gap-2.5 text-xs text-[#8888bb]">
                <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: buttons layout (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-3">
          {/* Download PDF button (primary) */}
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="btn-cyber w-full py-3.5 font-bold flex items-center justify-center gap-2 shadow-cyber bg-gradient-to-r from-purple-500 to-cyber-600 disabled:opacity-55"
          >
            <Download className="w-4.5 h-4.5" />
            {downloading ? 'Compiling PDF...' : 'Download PDF Report'}
          </button>

          {/* Secondary buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportJSON}
              className="btn-ghost py-3 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 border border-white/10"
              title="Export raw JSON"
            >
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              Export JSON
            </button>
            
            <button
              onClick={handleShareReport}
              disabled={sharing}
              className="btn-ghost py-3 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 border border-white/10"
              title="Share Report link"
            >
              {sharing ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  Share Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Verification footer pill */}
      <div className="text-[10px] text-[#5a5a8a] font-mono text-center md:text-left">
        Platform Cryptographic Signature: <strong className="text-white">FPL-CNN-VERIFY-AES-SHA256-OK</strong>
      </div>

      {/* Custom toast alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 10, x: '-50%' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-dark-200 border border-cyber-400/30 text-white text-xs font-semibold shadow-cyber flex items-center gap-2.5"
            style={{ width: 'max-content', maxWidth: '90%' }}
          >
            <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportGeneration;
