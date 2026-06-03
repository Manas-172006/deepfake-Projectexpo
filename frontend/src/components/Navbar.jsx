import { useState, useEffect } from 'react';
import { FlaskConical, AlertTriangle, Menu, X, ArrowRight, Activity } from 'lucide-react';
import { useHealthCheck } from '../hooks/useHealthCheck';

const Github = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const STATUS_CFG = {
  online:   { label: 'System Active', dotClass: 'online',   textClass: 'text-neon-green' },
  degraded: { label: 'System Degraded', dotClass: 'degraded', textClass: 'text-yellow-400' },
  offline:  { label: 'Server Offline', dotClass: 'offline',  textClass: 'text-neon-red'   },
  checking: { label: 'Connecting...',   dotClass: '',         textClass: 'text-[#8888bb]'  },
};

const Navbar = () => {
  const { status, details } = useHealthCheck(20000); // Poll health every 20 seconds
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.checking;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky header
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navLinks = [
    { label: 'Home', target: 'home' },
    { label: 'Detector', target: 'detector-workspace' },
    { label: 'How It Works', target: 'how-it-works' },
    { label: 'Model', target: 'model-architecture' },
    { label: 'Statistics', target: 'statistics-section' },
    { label: 'About', target: 'about-section' },
  ];

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-[#03030d]/80 backdrop-blur-xl border-white/[0.06] py-3 shadow-lg' 
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* ── Brand Logo ── */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-500 via-cyber-600 to-[#7c3aed]
                            flex items-center justify-center shadow-cyber transition-transform duration-300 group-hover:scale-105">
              <FlaskConical className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00ff88]
                            border-2 border-[#03030d] animate-pulse" />
          </div>

          <div>
            <span className="text-white font-black text-lg tracking-tight leading-none">
              FakeProof<span className="gradient-text"> Labs</span>
            </span>
            <p className="text-[#8888bb] text-[10px] font-mono tracking-widest uppercase leading-none mt-0.5">
              Forensic Deep Learning
            </p>
          </div>
        </div>

        {/* ── Center Navigation (Desktop) ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.target)}
              className="px-4 py-2 text-xs font-bold text-[#8888bb] hover:text-white rounded-lg hover:bg-white/[0.03] transition-all"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* ── Right side controls (Desktop) ── */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Health Status Indicator */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 select-none cursor-default"
            title={status === 'degraded' && details?.model_error ? `Error: ${details.model_error}` : undefined}
          >
            {cfg.dotClass ? (
              <span className={`status-dot ${cfg.dotClass}`} />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#5a5a8a] animate-pulse" />
            )}
            <span className={`text-[11px] font-mono font-bold ${cfg.textClass}`}>{cfg.label}</span>
            {status === 'degraded' && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
          </div>

          {/* GitHub Icon */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-[#8888bb] hover:text-white hover:bg-white/5 transition-all"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Action Trigger */}
          <button
            onClick={() => handleNavClick('detector-workspace')}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/15 text-white hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Mobile Menu Toggle ── */}
        <div className="flex items-center gap-3 lg:hidden">
          {/* Status for mobile */}
          <div className="w-3 h-3 flex items-center justify-center">
            {cfg.dotClass ? (
              <span className={`status-dot ${cfg.dotClass}`} />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#5a5a8a] animate-pulse" />
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-[#8888bb] hover:text-white hover:bg-white/5 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[100%] inset-x-0 bg-[#03030d]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl py-6 px-6 space-y-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.target)}
                className="w-full text-left py-3 px-4 text-sm font-semibold text-[#8888bb] hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="h-px bg-white/5" />

          <div className="flex justify-between items-center pt-2">
            {/* Status indicator */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`status-dot ${cfg.dotClass}`} />
              <span className={`${cfg.textClass}`}>{cfg.label}</span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-[#8888bb]"
              >
                <Github className="w-4.5 h-4.5" />
              </a>

              <button
                onClick={() => handleNavClick('detector-workspace')}
                className="btn-cyber py-2 px-4 text-xs font-bold"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Degraded Banner ── */}
      {status === 'degraded' && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2 flex items-center gap-2 text-yellow-300 text-xs justify-center font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>CNN model not loaded.</strong> Endpoint calls will execute in Demo Sandbox mode.
          </span>
        </div>
      )}
    </header>
  );
};

export default Navbar;
