/**
 * Profile — FakeProof Labs
 * User profile page
 */

import { useContext } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import MainLayout from '../layouts/MainLayout';
import { AuthContext } from '../contexts/AuthContext';
import NeuralNetworkBackground from '../components/NeuralNetworkBackground';
import { AnalysisHistoryService } from '../services/AnalysisHistoryService';

const Profile = () => {
  const authContext = useContext(AuthContext);
  const stats = AnalysisHistoryService.getStatistics();

  if (!authContext || !authContext.user) {
    return null;
  }

  const { user } = authContext;

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
            <h1 className="text-4xl font-black text-white mb-4">My Profile</h1>
            <p className="text-[#b8b8ff] text-lg">
              View your account information and statistics
            </p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden mb-6"
          >
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-cyber-500 to-[#7c3aed] flex items-center justify-center shadow-cyber flex-shrink-0">
                  <span className="text-4xl font-black text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-white mb-4">{user.name}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[#b8b8ff] uppercase font-bold">Email</p>
                        <p className="text-white font-mono text-sm">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[#8888bb] uppercase font-bold">
                          Account Type
                        </p>
                        <p className="text-white text-sm">
                          {user.isGuest ? 'Guest User' : 'Registered User'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Your Statistics</h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-[#8888bb] uppercase font-bold mb-2">
                    Total Analyses
                  </p>
                  <p className="text-3xl font-black text-white">
                    {stats.totalAnalyses}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-[#8888bb] uppercase font-bold mb-2">
                    Authentic
                  </p>
                  <p className="text-3xl font-black text-neon-green">
                    {stats.realCount}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-[#8888bb] uppercase font-bold mb-2">
                    Deepfakes
                  </p>
                  <p className="text-3xl font-black text-neon-red">
                    {stats.fakeCount}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-[#8888bb] uppercase font-bold mb-2">
                    Avg Confidence
                  </p>
                  <p className="text-3xl font-black text-yellow-400">
                    {stats.averageConfidence}%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </MainLayout>
  );
};

export default Profile;
