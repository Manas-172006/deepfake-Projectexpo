/**
 * Navbar — FakeProof Labs
 * Sticky top bar with branding and live backend status indicator.
 */

import { FlaskConical, Cpu, AlertTriangle } from 'lucide-react';
import { useHealthCheck } from '../hooks/useHealthCheck';

const STATUS_CFG = {
  online:   { label: 'Model Online',  dotClass: 'online',  textClass: 'text-neon-green' },
  degraded: { label: 'Model Offline', dotClass: 'offline', textClass: 'text-yellow-400' },
  offline:  { label: 'Offline',       dotClass: 'offline', textClass: 'text-neon-red'   },
  checking: { label: 'Connecting…',   dotClass: '',        textClass: 'text-[#8888bb]'  },
};

const Navbar = () => {
  const { status, details } = useHealthCheck(30000);
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.checking;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ── Brand ── */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-500 to-[#7c3aed]
                            flex items-center justify-center shadow-cyber">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00ff88]
                            border-2 border-[#0a0a0f] animate-pulse" />
          </div>

          <div>
            <span className="text-white font-bold text-lg tracking-tight leading-none">
              FakeProof<span className="gradient-text"> Labs</span>
            </span>
            <p className="text-[#8888bb] text-[10px] font-mono tracking-widest uppercase leading-none mt-0.5">
              AI Forensic Media Platform
            </p>
          </div>
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                          bg-white/5 border border-white/10 text-[#8888bb] text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-cyber-400" />
            TensorFlow · FastAPI · Grad-CAM
          </div>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full
                       bg-white/5 border border-white/10 cursor-default"
            title={
              status === 'degraded' && details?.model_error
                ? `Model error: ${details.model_error}`
                : undefined
            }
          >
            {cfg.dotClass ? (
              <span className={`status-dot ${cfg.dotClass}`} />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#5a5a8a] animate-pulse" />
            )}
            <span className={`text-xs font-semibold ${cfg.textClass}`}>{cfg.label}</span>
            {status === 'degraded' && (
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
            )}
          </div>
        </div>
      </div>

      {/* ── Degraded banner ── */}
      {status === 'degraded' && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2
                        flex items-center gap-2 text-yellow-300 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            <strong>Model not loaded.</strong>
            {details?.model_error
              ? ` ${details.model_error}`
              : ' The prediction endpoint is unavailable. Check server logs.'}
          </span>
        </div>
      )}
    </header>
  );
};

export default Navbar;
