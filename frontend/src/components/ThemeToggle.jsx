/**
 * ThemeToggle — FakeProof Labs
 * Dark/Light theme toggle button for navbar
 */

import { Moon, Sun } from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const themeContext = useContext(ThemeContext);

  if (!themeContext || !themeContext.toggleTheme) {
    return null;
  }

  const { theme } = themeContext;

  return (
    <button
      onClick={() => themeContext.toggleTheme()}
      className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-[#8888bb] hover:text-white hover:bg-white/5 transition-all group"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 group-hover:text-yellow-400 transition-colors" />
      ) : (
        <Moon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
      )}
    </button>
  );
};

export default ThemeToggle;
