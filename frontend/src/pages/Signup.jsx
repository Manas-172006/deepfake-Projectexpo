/**
 * Signup — FakeProof Labs
 * Account creation page with validation
 */

import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical, User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import NeuralNetworkBackground from '../components/NeuralNetworkBackground';

const Signup = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      authContext.signup(formData.name, formData.email, formData.password);

      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const passwordMatch = formData.password === formData.confirmPassword && formData.password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#03030d] relative overflow-hidden">
      {/* Background Effects */}
      <NeuralNetworkBackground />

      <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/10 via-transparent to-[#00d4ff]/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 w-full max-w-md px-6"
      >
        {/* Logo Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyber-500 via-cyber-600 to-[#7c3aed] flex items-center justify-center shadow-cyber">
                <FlaskConical className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00ff88] border-2 border-[#03030d] animate-pulse" />
            </div>
          </motion.div>

          <h1 className="text-3xl font-black text-white mb-2">
            FakeProof<span className="gradient-text"> Labs</span>
          </h1>
          <p className="text-[#b8b8ff] text-sm">
            Forensic Deep Learning Authentication
          </p>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Create Your Account</h2>
          <p className="text-sm text-[#b8b8ff]\">
            Join the AI forensics community and start analyzing today
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4 mb-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Name Field */}
          <div>
            <label className="text-xs font-bold text-[#b8b8ff] uppercase mb-2 block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8b8ff]" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#b8b8ff]/50 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="text-xs font-bold text-[#b8b8ff] uppercase mb-2 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8b8ff]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#b8b8ff]/50 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-xs font-bold text-[#b8b8ff] uppercase mb-2 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8b8ff]" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#b8b8ff]/50 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8b8ff] hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-[#b8b8ff] mt-1">Minimum 6 characters</p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="text-xs font-bold text-[#b8b8ff] uppercase mb-2 block">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8b8ff]" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#b8b8ff]/50 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8b8ff] hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              {passwordMatch && (
                <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-green" />
              )}
            </div>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyber-500 to-[#7c3aed] hover:shadow-cyber text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-[#b8b8ff]">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
