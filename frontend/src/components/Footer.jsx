import { FlaskConical, GraduationCap, MapPin, Mail } from 'lucide-react';

const Github = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Footer = () => {
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Home', target: 'home' },
    { label: 'Detector Workspace', target: 'detector-workspace' },
    { label: 'How It Works', target: 'how-it-works' },
    { label: 'Model Architecture', target: 'model-architecture' },
    { label: 'Statistics', target: 'statistics-section' },
    { label: 'About Project', target: 'about-section' },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-[#03030d] pt-16 pb-8 px-6 relative z-10">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-2 md:grid-cols-12 gap-8 text-xs text-[#b8b8ff] pb-12 border-b border-white/[0.04]">
        
        {/* Column 1: Platform Summary (4 cols) */}
        <div className="col-span-2 md:col-span-4 space-y-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleScrollTo('home')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-500 to-[#7c3aed] flex items-center justify-center">
              <FlaskConical className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-white font-black text-sm tracking-tight">
              FakeProof<span className="gradient-text"> Labs</span>
            </span>
          </div>
          <p className="leading-relaxed text-[#b8b8ff] max-w-sm">
            An advanced digital forensics and media verification platform engineered for news agencies, media verification agencies, and cybersecurity analysts. 
            Utilizes custom deep learning models and Grad-CAM class mapping for explainable AI outputs.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <MapPin className="w-3.5 h-3.5 text-cyan-500/60" />
            Project Expo Hall · Dept of CSE
          </div>
        </div>

        {/* Column 2: Navigation Links (2 cols) */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
            Navigation
          </h4>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => handleScrollTo(link.target)}
                  className="hover:text-white transition-colors text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Tech Stack (2 cols) */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
            Tech Stack
          </h4>
          <ul className="space-y-2 font-mono text-[11px]">
            {['React & Vite', 'FastAPI Web Server', 'TensorFlow 2.x', 'OpenCV & NumPy', 'Tailwind CSS', 'Framer Motion'].map((tech) => (
              <li key={tech} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-cyan-500/70" />
                {tech}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Project Expo Team (4 cols) */}
        <div className="col-span-2 md:col-span-4 space-y-4">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
            Project Team Lead
          </h4>
          <ul className="space-y-2">
            <li>
              <span className="text-white font-semibold">Lead Developer:</span>
              <p className="text-[11px] font-mono mt-0.5">Manas Praveen Narule</p>
            </li>
            <li>
              <span className="text-white font-semibold">USN:</span>
              <p className="text-[11px] font-mono mt-0.5">21124088027</p>
            </li>
            <li>
              <span className="text-white font-semibold">Role:</span>
              <p className="text-[11px] font-mono mt-0.5">TEAM LEAD • ML ENGINEER • PROJECT COORDINATOR</p>
            </li>
            <li className="pt-2">
              <a
                href="https://github.com/Manas-172006"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-cyan-400 transition-all font-mono text-[10px] bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg hover:border-cyan-400/50"
              >
                <Github className="w-3.5 h-3.5 text-cyan-400" />
                GitHub Profile
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto w-full pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#8a8acc] font-mono">
        <span>
          © {new Date().getFullYear()} FakeProof Labs | AI-Powered Deepfake Detection Platform
        </span>
        <div className="flex items-center gap-3">
          <a href="mailto:info@fakeprooflabs.io" className="hover:text-white transition-colors flex items-center gap-1">
            <Mail className="w-3 h-3 text-purple-500/50" />
            Support
          </a>
          <span>·</span>
          <span>Expo Edition v2.0.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
