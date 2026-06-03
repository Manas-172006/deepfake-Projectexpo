/**
 * Main layout wrapper — provides the dark grid background,
 * ambient glow orbs, and consistent page structure.
 */

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-dark-50 overflow-x-hidden">

      {/* Ambient background grid */}
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none" />

      {/* Top glow orb */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Bottom-right purple orb */}
      <div
        className="fixed bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at bottom right, rgba(124,58,237,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
