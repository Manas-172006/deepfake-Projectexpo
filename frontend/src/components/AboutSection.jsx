import { motion } from 'framer-motion';
import { Target, Users, BookOpen, AlertCircle, Sparkles, Shield } from 'lucide-react';

const Github = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TEAM = [
  {
    name: 'Manas Praveen Narule',
    role: 'TEAM LEAD • ML ENGINEER • PROJECT COORDINATOR',
    usn: '21124088027',
    github: 'https://github.com/Manas-172006',
    linkedin: '',
  },
  {
    name: 'Viswajith Reddy Panduga',
    department: 'CSE (AI & ML)',
    usn: '2102508615',
    github: '',
    linkedin: '',
  },
  {
    name: 'Sankar Narayana Reddy V',
    department: 'CSE (AI & ML)',
    usn: '2082508387',
    github: '',
    linkedin: '',
  },
  {
    name: 'Shaik Uzhmaa Ada',
    department: 'Data Science',
    usn: '2112508903',
    github: '',
    linkedin: '',
  },
];

const AboutSection = () => {
  return (
    <section id="about-section" className="relative py-32 px-6 overflow-hidden border-t border-white/[0.04]">
      {/* Background gradients */}
      <div className="absolute top-1/3 left-0 w-[450px] aspect-square rounded-full bg-cyan-500/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] aspect-square rounded-full bg-purple-600/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10 space-y-20">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <span className="badge bg-purple-500/10 border border-purple-500/20 text-purple-300 gap-1.5 py-1 px-3">
            <BookOpen className="w-3.5 h-3.5" />
            Documentation
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            About the <span className="gradient-text">Project</span>
          </h2>
          <p className="text-[#b8b8ff] text-sm leading-relaxed">
            Unveiling the mission, importance, and team behind the development of FakeProof Labs.
          </p>
        </div>

        {/* Mission & Overview Cards Grid (2x2 layout) */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Mission Card */}
          <div className="glass-card border-glow p-6 rounded-2xl relative overflow-hidden bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-bold text-base">Mission Statement</h3>
            </div>
            <p className="text-[#8888bb] text-xs leading-relaxed">
              Our mission is to establish digital trust and media integrity in an era of hyper-realistic generative AI. 
              By combining state-of-the-art Convolutional Neural Networks with Explainable Artificial Intelligence (XAI) models like Grad-CAM, 
              we empower journalists, cybersecurity teams, and enterprises to classify visual assets accurately and audit digital media evidence transparently.
            </p>
          </div>

          {/* Project Overview Card */}
          <div className="glass-card border-glow p-6 rounded-2xl relative overflow-hidden bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-bold text-base">Project Overview</h3>
            </div>
            <p className="text-[#8888bb] text-xs leading-relaxed">
              FakeProof Labs is a complete end-to-end digital media forensics client-server framework. 
              The backend leverages a TensorFlow-trained CNN model optimized for synthetic face artifact classification, connected to a lightweight FastAPI server. 
              The web app captures webcam feeds or takes local uploads, processes the frames, and overlays gradient weights to highlight localized anomalies.
            </p>
          </div>

          {/* Importance of Detection Card */}
          <div className="glass-card border-glow p-6 rounded-2xl relative overflow-hidden bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-base">Importance of Deepfake Detection</h3>
            </div>
            <p className="text-[#8888bb] text-xs leading-relaxed">
              Generative models have advanced beyond the capability of the human eye to reliably detect. 
              Deepfakes pose severe threats to political stability, financial transactions, legal evidence, and individual privacy. 
              Automated classifiers offer a crucial line of defense by detecting high-frequency spatial discrepancies in image textures that generators leave behind.
            </p>
          </div>

          {/* Explainable AI Card */}
          <div className="glass-card border-glow p-6 rounded-2xl relative overflow-hidden bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-white font-bold text-base">Benefits of Explainable AI (XAI)</h3>
            </div>
            <p className="text-[#8888bb] text-xs leading-relaxed">
              Standard neural network classifiers function as "black boxes," outputting decisions without context. 
              Explainable AI bridges this trust gap. By using Grad-CAM, FakeProof Labs mathematically highlights the exact pixels 
              that influenced the model decision. This provides forensic examiners with audit trails rather than just raw prediction scores.
            </p>
          </div>

        </div>

        {/* Team Grid section */}
        <div className="space-y-10">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-cyan-400">
              <Users className="w-5 h-5" />
              <h3 className="text-white font-bold text-lg">Project Expo Team</h3>
            </div>
            <p className="text-[#8888bb] text-xs">The engineers behind the development of the FakeProof platform</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div 
                key={member.name}
                className="glass-card border-glow p-5 rounded-2xl flex flex-col justify-between items-center text-center hover:scale-[1.03] transition-all duration-300 bg-white/[0.01]"
              >
                <div className="space-y-3">
                  {/* Mock profile avatar shape */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-500/10 to-purple-600/10 border border-white/5 flex items-center justify-center mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-20" />
                    <span className="text-white font-black text-lg select-none font-mono">
                      {member.name.split(' ').pop()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-sm leading-tight">{member.name}</h4>
                    {member.role ? (
                      <span className="text-purple-400 text-[10px] font-semibold tracking-wider uppercase block mt-1">
                        {member.role}
                      </span>
                    ) : member.department ? (
                      <span className="text-cyan-400/80 text-[10px] font-semibold tracking-wider uppercase block mt-1">
                        {member.department}
                      </span>
                    ) : null}
                  </div>

                  <div className="text-[#8888bb] text-[10px] font-mono select-all">
                    USN: {member.usn}
                  </div>
                </div>

                {(member.github || member.linkedin) && (
                  <div className="flex items-center gap-2.5 mt-5 pt-4 border-t border-white/[0.05] w-full justify-center">
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg hover:bg-white/5 border border-white/5 flex items-center justify-center text-[#8888bb] hover:text-cyan-400 transition-colors hover:border-cyan-400/50"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg hover:bg-white/5 border border-white/5 flex items-center justify-center text-[#8888bb] hover:text-[#0077b5] transition-colors hover:border-[#0077b5]/50"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
