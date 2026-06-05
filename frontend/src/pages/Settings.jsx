/**
 * Settings — FakeProof Labs
 * User settings page for theme, account, and preferences
 */

import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Trash2, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MainLayout from '../layouts/MainLayout';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { AnalysisHistoryService } from '../services/AnalysisHistoryService';
import NeuralNetworkBackground from '../components/NeuralNetworkBackground';

const Settings = () => {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const authContext = useContext(AuthContext);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleThemeChange = (newTheme) => {
    if (themeContext && themeContext.applyTheme) {
      themeContext.applyTheme(newTheme);
    }
  };

  const handleClearHistory = () => {
    AnalysisHistoryService.clearHistory();
    setShowClearConfirm(false);
  };

  const handleLogout = () => {
    if (authContext && authContext.logout) {
      authContext.logout();
      navigate('/login');
    }
  };

  const stats = AnalysisHistoryService.getStatistics();

  return (
    <MainLayout>
      <NeuralNetworkBackground />
      <Navbar />

      <main className="relative z-10 min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-black text-white mb-4">Settings</h1>
            <p className="text-[#b8b8ff] text-lg">
              Manage your account, preferences, and data
            </p>
          </motion.div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Account Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <SettingsIcon className="w-4 h-4 text-cyan-400" />
                  </div>
                  Account Information
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#b8b8ff] uppercase mb-2 block">
                    Display Name
                  </label>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm">
                    {authContext?.user?.name || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#b8b8ff] uppercase mb-2 block">
                    Email Address
                  </label>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm">
                    {authContext?.user?.email || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#b8b8ff] uppercase mb-2 block">
                    Account Type
                  </label>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded inline-block ${
                        authContext?.user?.isGuest
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}
                    >
                      {authContext?.user?.isGuest ? 'Guest User' : 'Registered User'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Theme Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <Moon className="w-4 h-4 text-purple-400" />
                  </div>
                  Theme Settings
                </h2>
              </div>

              <div className="p-6">
                <p className="text-sm text-[#b8b8ff] mb-4">Select your preferred theme</p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      themeContext?.theme === 'dark'
                        ? 'bg-[#0a0a15] border-cyan-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Moon className="w-5 h-5" />
                      <span className="font-bold text-white">Dark Mode</span>
                    </div>
                    <p className="text-xs text-[#b8b8ff]">Professional dark interface</p>
                  </button>

                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      themeContext?.theme === 'light'
                        ? 'bg-[#f5f5f5] border-yellow-400/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Sun className="w-5 h-5" />
                      <span className="font-bold text-white">Light Mode</span>
                    </div>
                    <p className="text-xs text-[#b8b8ff]">Clean light interface</p>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Data & History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-green-400" />
                  </div>
                  Data & History
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 py-4 border-b border-white/10">
                    <div>
                      <p className="text-xs text-[#b8b8ff] uppercase font-bold mb-1">
                        Total Analyses
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {stats.totalAnalyses}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#b8b8ff] uppercase font-bold mb-1">
                        Authentic
                      </p>
                      <p className="text-2xl font-bold text-neon-green">{stats.realCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#b8b8ff] uppercase font-bold mb-1">
                        Deepfakes
                      </p>
                      <p className="text-2xl font-bold text-neon-red">{stats.fakeCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#b8b8ff] uppercase font-bold mb-1">
                        Avg Confidence
                      </p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {stats.averageConfidence}%
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Analysis History
                  </button>

                  {showClearConfirm && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
                    >
                      <p className="text-red-400 text-sm mb-3">
                        Are you sure? This action cannot be undone. All {stats.totalAnalyses}{' '}
                        analyses will be permanently deleted.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleClearHistory}
                          className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all"
                        >
                          Yes, Clear Everything
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Logout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-6">
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout from FakeProof Labs
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </MainLayout>
  );
};

export default Settings;
