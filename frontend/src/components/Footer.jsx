/**
 * Footer — FakeProof Labs
 */

import { FlaskConical } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-white/[0.08] py-8 px-6">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center
                    justify-between gap-4 text-[#5a5a8a] text-xs">

      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-cyber-500/60" />
        <span>
          <span className="text-[#b0b0d0] font-semibold">FakeProof Labs</span>
          {' '}· AI Forensic Media Authenticity Platform · University Project Expo 2025
        </span>
      </div>

      <div className="flex items-center gap-4 font-mono">
        {[
          { dot: 'bg-cyber-500/60',          label: 'TensorFlow'  },
          { dot: 'bg-[#7c3aed]/60',           label: 'FastAPI'     },
          { dot: 'bg-[#00ff88]/60',           label: 'React'       },
          { dot: 'bg-yellow-400/60',          label: 'Grad-CAM'    },
          { dot: 'bg-[#00d4ff]/60',           label: 'Gemini AI'   },
        ].map(({ dot, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
