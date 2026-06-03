import { useState } from 'react';

// Layout & Shell components
import MainLayout from './layouts/MainLayout';
import Navbar from './components/Navbar';
import StartupLoader from './components/StartupLoader';

// Landing Page & Dashboard sections
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import AnalysisPanel from './components/AnalysisPanel';
import ModelArchitecture from './components/ModelArchitecture';
import StatisticsSection from './components/StatisticsSection';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import NeuralNetworkBackground from './components/NeuralNetworkBackground';

function App() {
  const [isStartupLoading, setIsStartupLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // Trigger metrics updates globally if needed
  const handleAnalysisComplete = () => {
    setTick((t) => t + 1);
  };

  return (
    <>
      {/* Immersive Full-Screen Startup Loader */}
      {isStartupLoading && (
        <StartupLoader onComplete={() => setIsStartupLoading(false)} />
      )}

      {/* Main Forensic Dashboard */}
      {!isStartupLoading && (
        <MainLayout>
          {/* Global Network background canvas */}
          <NeuralNetworkBackground />
          <Navbar />
          
          <main className="space-y-0">
            {/* 1. Hero Landing Block */}
            <HeroSection />

            {/* 2. Process Workflow Pipeline */}
            <HowItWorks />

            {/* 3. Deepfake Detection Analyzer Workspace */}
            <AnalysisPanel onAnalysisComplete={handleAnalysisComplete} />

            {/* 4. Sequenced CNN Model Visualizations */}
            <ModelArchitecture />

            {/* 5. Model Performance Metrics */}
            <StatisticsSection />

            {/* 6. Mission, Project Scope, & Expo Members */}
            <AboutSection />
          </main>

          {/* Platform Footer */}
          <Footer />
        </MainLayout>
      )}
    </>
  );
}

export default App;
