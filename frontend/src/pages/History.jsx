/**
 * History — FakeProof Labs
 * Analysis history viewer with download and delete capabilities
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Download, Eye, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import Navbar from '../components/Navbar';
import MainLayout from '../layouts/MainLayout';
import { AnalysisHistoryService } from '../services/AnalysisHistoryService';
import NeuralNetworkBackground from '../components/NeuralNetworkBackground';

const History = () => {
  const [history, setHistory] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load history from localStorage
    const analyses = AnalysisHistoryService.getHistory();
    setHistory(analyses);
    setIsLoading(false);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      AnalysisHistoryService.deleteAnalysis(id);
      const updated = AnalysisHistoryService.getHistory();
      setHistory(updated);
      setSelectedAnalysis(null);
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all analysis history? This cannot be undone.'
      )
    ) {
      AnalysisHistoryService.clearHistory();
      setHistory([]);
      setSelectedAnalysis(null);
    }
  };

  const handleExport = () => {
    const dataStr = AnalysisHistoryService.exportHistory();
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `fakeproof-history-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const stats = AnalysisHistoryService.getStatistics();

  return (
    <MainLayout>
      <NeuralNetworkBackground />
      <Navbar />

      <main className="relative z-10 min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-black text-white mb-4">Analysis History</h1>
            <p className="text-[#b8b8ff] text-lg">
              View and manage your deepfake detection analyses
            </p>
          </motion.div>

          {/* Statistics Cards */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-[#8888bb] uppercase">
                    Total Analyses
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalAnalyses}</p>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-4 h-4 text-neon-green" />
                  <span className="text-xs font-bold text-[#8888bb] uppercase">
                    Authentic
                  </span>
                </div>
                <p className="text-2xl font-bold text-neon-green">{stats.realCount}</p>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-4 h-4 text-neon-red" />
                  <span className="text-xs font-bold text-[#8888bb] uppercase">
                    Deepfakes
                  </span>
                </div>
                <p className="text-2xl font-bold text-neon-red">{stats.fakeCount}</p>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-bold text-[#8888bb] uppercase">
                    Avg Confidence
                  </span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{stats.averageConfidence}%</p>
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* History List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-[#b8b8ff]">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-[#b8b8ff] mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-bold text-white mb-2">No Analysis History</h3>
                  <p className="text-[#8888bb]">
                    Start analyzing images to build your history
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((analysis, index) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedAnalysis(analysis)}
                      className={`p-4 rounded-lg border backdrop-blur-xl cursor-pointer transition-all ${
                        selectedAnalysis?.id === analysis.id
                          ? 'bg-cyan-500/10 border-cyan-500/50'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {analysis.image && (
                          <img
                            src={analysis.image}
                            alt="Analysis"
                            className="w-16 h-16 rounded object-cover border border-white/10"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded ${
                                analysis.prediction === 'Fake' || analysis.prediction === 'Deepfake Detected'
                                  ? 'bg-neon-red/20 text-neon-red'
                                  : 'bg-neon-green/20 text-neon-green'
                              }`}
                            >
                              {analysis.prediction}
                            </span>
                            <span className="text-xs text-[#b8b8ff]">
                              {analysis.confidence}% confidence
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#b8b8ff]">
                            <Calendar className="w-3 h-3" />
                            <span>{analysis.date}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              {selectedAnalysis ? (
                <div className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl p-6 sticky top-32">
                  <h3 className="text-lg font-bold text-white mb-4">Analysis Details</h3>

                  {selectedAnalysis.image && (
                    <img
                      src={selectedAnalysis.image}
                      alt="Analysis"
                      className="w-full rounded-lg mb-4 border border-white/10"
                    />
                  )}

                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-[#b8b8ff] text-xs uppercase font-bold mb-1">Verdict</p>
                      <p
                        className={`font-bold ${
                          selectedAnalysis.prediction === 'Fake' || selectedAnalysis.prediction === 'Deepfake Detected'
                            ? 'text-neon-red'
                            : 'text-neon-green'
                        }`}
                      >
                        {selectedAnalysis.prediction}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#b8b8ff] text-xs uppercase font-bold mb-1">Confidence</p>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            selectedAnalysis.confidence >= 70
                              ? 'bg-neon-green'
                              : 'bg-yellow-400'
                          }`}
                          style={{ width: `${selectedAnalysis.confidence}%` }}
                        />
                      </div>
                      <p className="text-white font-bold mt-1">
                        {selectedAnalysis.confidence}%
                      </p>
                    </div>

                    <div>
                      <p className="text-[#8888bb] text-xs uppercase font-bold mb-1">
                        Timestamp
                      </p>
                      <p className="text-white">
                        {selectedAnalysis.date} {selectedAnalysis.time}
                      </p>
                    </div>

                    {selectedAnalysis.processingTime && (
                      <div>
                        <p className="text-[#b8b8ff] text-xs uppercase font-bold mb-1">
                          Processing Time
                        </p>
                        <p className="text-white">{selectedAnalysis.processingTime}ms</p>
                      </div>
                    )}

                    <div>
                      <p className="text-[#b8b8ff] text-xs uppercase font-bold mb-2">
                        Summary
                      </p>
                      <p className="text-[#b8b8ff] text-xs leading-relaxed">
                        {selectedAnalysis.summary ||
                          'No summary available for this analysis.'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => handleDelete(selectedAnalysis.id)}
                      className="w-full px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Analysis
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl p-6 sticky top-32 text-center">
                  <Eye className="w-8 h-8 text-[#b8b8ff] mx-auto mb-3 opacity-50" />
                  <p className="text-[#b8b8ff] text-sm">
                    Select an analysis to view details
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Action Buttons */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <button
                onClick={handleExport}
                className="px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2 font-bold text-sm"
              >
                <Download className="w-4 h-4" />
                Export History
              </button>

              <button
                onClick={handleClearAll}
                className="px-6 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 font-bold text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All History
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </MainLayout>
  );
};

export default History;
