import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import StartupLoader from './components/StartupLoader';

// Layout & Shell components
import MainLayout from './layouts/MainLayout';
import Navbar from './components/Navbar';

// Landing Page & Dashboard sections
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import AnalysisPanel from './components/AnalysisPanel';
import ModelArchitecture from './components/ModelArchitecture';
import StatisticsSection from './components/StatisticsSection';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import NeuralNetworkBackground from './components/NeuralNetworkBackground';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import History from './pages/History';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// Landing Page Component
const LandingPage = ({ onAnalysisComplete }) => {
  return (
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
        <AnalysisPanel onAnalysisComplete={onAnalysisComplete} />

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
  );
};

function App() {
  const [isStartupLoading, setIsStartupLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const handleAnalysisComplete = () => {
    setTick((t) => t + 1);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {isStartupLoading && (
            <StartupLoader onComplete={() => setIsStartupLoading(false)} />
          )}

          {!isStartupLoading && (
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <LandingPage onAnalysisComplete={handleAnalysisComplete} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
