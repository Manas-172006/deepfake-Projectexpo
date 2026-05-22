/**
 * App — root component.
 * Composes: Navbar · Hero · AnalysisPanel · MetricsDashboard · HowItWorks · Footer
 */

import { useState, useCallback } from 'react';

import MainLayout      from './layouts/MainLayout';
import Navbar          from './components/Navbar';
import HeroSection     from './components/HeroSection';
import AnalysisPanel   from './components/AnalysisPanel';
import MetricsDashboard from './components/MetricsDashboard';
import HowItWorks      from './components/HowItWorks';
import Footer          from './components/Footer';
import { getAnalysisCount } from './components/MetricsDashboard';

function App() {
  /* Re-render trigger so MetricsDashboard picks up the new session count */
  const [tick, setTick] = useState(0);
  const handleAnalysisComplete = useCallback(() => setTick((t) => t + 1), []);

  return (
    <MainLayout>
      <Navbar />
      <HeroSection />
      <AnalysisPanel onAnalysisComplete={handleAnalysisComplete} />
      <MetricsDashboard sessionAnalyses={getAnalysisCount()} key={tick} />
      <HowItWorks />
      <Footer />
    </MainLayout>
  );
}

export default App;
