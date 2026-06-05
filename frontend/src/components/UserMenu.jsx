/**
 * UserMenu — FakeProof Labs
 * User dropdown menu with profile, history, settings, and logout
 */

import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, Settings, History, User, ChevronDown } from 'lucide-react';

const UserMenu = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  if (!authContext || !authContext.isAuthenticated || !authContext.user) {
    return null;
  }

  const { user, logout } = authContext;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuItemClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
      >
        {/* Avatar */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyber-500 to-[#7c3aed] flex items-center justify-center text-xs font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>

        {/* User Name */}
        <span className="text-xs font-bold text-[#8888bb] group-hover:text-white transition-colors max-w-[80px] truncate hidden sm:inline">
          {user.name}
        </span>

        {/* Chevron Icon */}
        <ChevronDown
          className={`w-3 h-3 text-[#8888bb] group-hover:text-white transition-all ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/10 bg-[#0a0a15]/95 backdrop-blur-xl shadow-lg overflow-hidden z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs text-[#8888bb]">Logged in as</p>
            <p className="font-bold text-white text-sm">{user.name}</p>
            <p className="text-xs text-[#8888bb] truncate">{user.email}</p>
            {user.isGuest && (
              <p className="text-xs text-yellow-400 mt-1">Guest Mode</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => handleMenuItemClick('/profile')}
              className="w-full px-4 py-2 flex items-center gap-3 text-sm text-[#8888bb] hover:text-white hover:bg-white/5 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => handleMenuItemClick('/history')}
              className="w-full px-4 py-2 flex items-center gap-3 text-sm text-[#8888bb] hover:text-white hover:bg-white/5 transition-all"
            >
              <History className="w-4 h-4" />
              <span>Analysis History</span>
            </button>

            <button
              onClick={() => handleMenuItemClick('/settings')}
              className="w-full px-4 py-2 flex items-center gap-3 text-sm text-[#8888bb] hover:text-white hover:bg-white/5 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Logout Button */}
          <div className="border-t border-white/5 py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 flex items-center gap-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
