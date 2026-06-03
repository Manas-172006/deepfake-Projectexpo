import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Cpu, Server, Database, Check, Award, Activity, HelpCircle } from 'lucide-react';

const TECH_STACK = [
  { name: 'React', desc: 'Frontend Framework' },
  { name: 'FastAPI', desc: 'Python API Server' },
  { name: 'TensorFlow', desc: 'Deep Learning Model' },
  { name: 'OpenCV', desc: 'Image Preprocessing' },
  { name: 'NumPy', desc: 'Tensor Computations' },
  { name: 'Tailwind CSS', desc: 'Styling Engine' },
];

const METRICS = [
  { name: 'Accuracy', value: '99.2%', desc: 'Overall detection rate' },
  { name: 'Precision', value: '98.7%', desc: 'True positive authenticity' },
  { name: 'Recall', value: '97.4%', desc: 'Sensitivity to fakes' },
  { name: 'F1 Score', value: '98.0%', desc: 'Harmonic mean of indicators' },
];

const LAYERS = [
  { 
    id: 'input', 
    name: 'Input Layer', 
    dims: '224 × 224 × 3', 
    type: 'RGB Tensor', 
    desc: 'Normalizes and downscales uploaded frames to standard RGB float dimensions [0, 1] for model consumption.' 
  },
  { 
    id: 'conv1', 
    name: 'Convolutional Layer 01', 
    dims: '222 × 222 × 32', 
    type: 'Conv2D (3x3 Kernel)', 
    desc: 'Extracts low-level spatial descriptors, texture gradients, and high-frequency noise residuals from boundaries.' 
  },
  { 
    id: 'pool1', 
    name: 'Max Pooling Layer 01', 
    dims: '111 × 111 × 32', 
    type: 'MaxPooling2D (2x2)', 
    desc: 'Downsamples dimensionality to restrict parameter bloat, keeping translationally invariant texture signatures.' 
  },
  { 
    id: 'conv2', 
    name: 'Convolutional Layer 02', 
    dims: '109 × 109 × 64', 
    type: 'Conv2D (3x3 Kernel)', 
    desc: 'Extracts semantic facial artifacts, GAN upsampling interpolations, and irregularities in micro-expression contours.' 
  },
  { 
    id: 'pool2', 
    name: 'Max Pooling Layer 02', 
    dims: '54 × 54 × 64', 
    type: 'MaxPooling2D (2x2)', 
    desc: 'Further downsamples spatial features while reinforcing peak convolutional activations.' 
  },
  { 
    id: 'flatten', 
    name: 'Flattening Layer', 
    dims: '186,624 Nodes', 
    type: 'Flatten Tensor', 
    desc: 'Flattens multidimensional activation maps into a single 1D feature array ready for dense classification.' 
  },
  { 
    id: 'dense', 
    name: 'Fully Connected Layer', 
    dims: '128 Neurons', 
    type: 'Dense (ReLU)', 
    desc: 'Aggregates features and correlates localized anomalies to map overall authenticity keys.' 
  },
  { 
    id: 'output', 
    name: 'Sigmoid Output', 
    dims: '1 Node', 
    type: 'Dense (Sigmoid)', 
    desc: 'Outputs a final continuous probability value between 0.0 (Authentic) and 1.0 (Deepfake synthetic).' 
  },
];

const ModelArchitecture = () => {
  const [activeLayer, setActiveLayer] = useState(LAYERS[0]);

  return (
    <section id="model-architecture" className="relative py-32 px-6 overflow-hidden border-t border-white/[0.04]">
      {/* Background gradients */}
      <div className="absolute top-1/4 right-[10%] w-[450px] aspect-square rounded-full bg-purple-600/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-[10%] w-[450px] aspect-square rounded-full bg-cyan-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <span className="badge bg-purple-500/10 border border-purple-500/20 text-purple-300 gap-1.5 py-1 px-3">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            Academic Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            CNN Model <span className="gradient-text">Architecture</span>
          </h2>
          <p className="text-[#8888bb] text-sm leading-relaxed">
            Technical specs and layer breakdown of our Custom Convolutional Neural Network trained for media forensics.
          </p>
        </div>

        {/* Top: Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {METRICS.map((m) => (
            <div 
              key={m.name}
              className="glass-card border-glow p-5 rounded-2xl text-center bg-white/[0.01]"
              style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
            >
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block mb-1">
                {m.name}
              </span>
              <div className="text-3xl font-black text-white leading-none font-mono">
                {m.value}
              </div>
              <p className="text-[11px] text-[#8888bb] mt-2 leading-tight">
                {m.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom: Layer Visualizer */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Layers stack (7 cols) */}
          <div className="lg:col-span-7 glass-card border-glow p-6 rounded-2xl flex flex-col justify-between">
            <div className="space-y-2 mb-6">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                Sequential Feature Flow
              </span>
              <h3 className="text-white font-bold text-base">Interactive Neural Pipeline</h3>
              <p className="text-[#8888bb] text-xs">Hover or tap on model layers to inspect tensor shapes and operations.</p>
            </div>

            {/* Visual Layers Stack */}
            <div className="flex flex-col gap-2">
              {LAYERS.map((layer) => {
                const isActive = activeLayer.id === layer.id;
                return (
                  <div
                    key={layer.id}
                    onMouseEnter={() => setActiveLayer(layer)}
                    onClick={() => setActiveLayer(layer)}
                    className={`relative px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/50 shadow-cyber' 
                        : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03] hover:border-white/10'
                    }`}
                  >
                    {/* Active Layer glowing left bar */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7c3aed] to-cyan-400 rounded-l-xl" />
                    )}

                    <div className="flex items-center gap-3">
                      <Layers className={`w-4 h-4 transition-colors ${isActive ? 'text-purple-400' : 'text-[#5a5a8a]'}`} />
                      <span className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-[#8888bb]'}`}>
                        {layer.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <span className="text-[10px] font-mono text-[#5a5a8a] hidden sm:inline">{layer.type}</span>
                      <span className="badge bg-white/5 border border-white/10 text-white font-mono text-[9px] py-0.5 px-2">
                        {layer.dims}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Active Layer description details (5 cols) */}
          <div className="lg:col-span-5">
            <div className="glass-card border-glow p-6 rounded-2xl h-full flex flex-col justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.05]">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Cpu className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Layer Inspector</h3>
                    <p className="text-[#8888bb] text-[10px] font-mono">Tensor Dimensions & Function</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#8888bb] uppercase tracking-wider block mb-1">
                      Layer Identifier
                    </span>
                    <p className="text-white font-black text-lg">{activeLayer.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#8888bb] uppercase tracking-wider block mb-1">
                        Tensor Dimensions
                      </span>
                      <p className="text-cyan-400 font-bold font-mono text-sm">{activeLayer.dims}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#8888bb] uppercase tracking-wider block mb-1">
                        Layer Type
                      </span>
                      <p className="text-purple-400 font-bold text-xs">{activeLayer.type}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-[#8888bb] uppercase tracking-wider block mb-1">
                      Analytical Function
                    </span>
                    <p className="text-[#8888bb] text-xs leading-relaxed">
                      {activeLayer.desc}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.05] mt-6 flex justify-between items-center text-[10px] text-[#5a5a8a] font-mono">
                <span>Activation function: {activeLayer.id === 'output' ? 'Sigmoid' : activeLayer.id === 'dense' ? 'ReLU' : 'Conv Mapping'}</span>
                <span>Trainable parameters</span>
              </div>
            </div>
          </div>

        </div>

        {/* Tech Stack Badges Row */}
        <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-white/[0.04] pt-8">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-500/70" />
            <span className="text-xs text-[#8888bb] font-semibold">Model Production Stack:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {TECH_STACK.map((t) => (
              <span 
                key={t.name}
                className="badge bg-white/5 border border-white/10 text-white font-mono text-[10px] px-3.5 py-1 hover:border-cyan-500/30 transition-colors"
                title={t.desc}
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ModelArchitecture;
