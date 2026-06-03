import { useEffect, useRef } from 'react';

const MainLayout = ({ children }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      container.style.setProperty('--x', `${x}px`);
      container.style.setProperty('--y', `${y}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-[#03030d] overflow-x-hidden spotlight-bg"
    >
      {/* Dynamic Ambient Background Grid */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none" />

      {/* Top Center purple glow orb */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Bottom Right cyan glow orb */}
      <div
        className="fixed bottom-0 right-0 w-[600px] h-[600px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at bottom right, rgba(0, 212, 255, 0.04) 0%, transparent 75%)',
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
