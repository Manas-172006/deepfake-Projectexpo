# FakeProof Labs - Quick Reference Guide

## 📋 Installation & Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔑 Key Files by Feature

| Feature | Files |
|---------|-------|
| **Authentication** | `AuthContext.jsx`, `Login.jsx`, `Signup.jsx` |
| **Theme System** | `ThemeContext.jsx`, `ThemeToggle.jsx`, `index.css` |
| **History** | `AnalysisHistoryService.js`, `History.jsx` |
| **Settings** | `Settings.jsx`, `Profile.jsx` |
| **Routes** | `App.jsx`, `ProtectedRoute.jsx` |
| **UI** | `UserMenu.jsx`, `Navbar.jsx` |

## 🚀 Quick Links

### Pages
- **Login**: `/login`
- **Signup**: `/signup`
- **Dashboard**: `/`
- **History**: `/history`
- **Settings**: `/settings`
- **Profile**: `/profile`

### localStorage Keys
- `authenticated` - Auth status
- `userName` - User name
- `userEmail` - User email
- `isGuest` - Guest flag
- `theme` - Dark/Light mode
- `analysisHistory` - Analysis records

## 🎯 Usage Examples

### Login with Demo Account
```
Email: test@example.com
Password: password123
```

### Continue as Guest
Click "Continue as Guest" button - instant access

### Theme Toggle
Click sun/moon icon in navbar

### View Analysis History
Click user menu → "Analysis History" → View past analyses

### Export History
Go to `/history` → Click "Export History" button

## 🛠️ Component Integration

### Using AuthContext
```jsx
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const MyComponent = () => {
  const authContext = useContext(AuthContext);
  const { user, isAuthenticated, logout } = authContext;
  
  return <div>{user?.name}</div>;
};
```

### Using ThemeContext
```jsx
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const MyComponent = () => {
  const themeContext = useContext(ThemeContext);
  const { theme, toggleTheme } = themeContext;
  
  return <button onClick={toggleTheme}>Toggle</button>;
};
```

### Using AnalysisHistoryService
```jsx
import { AnalysisHistoryService } from '../services/AnalysisHistoryService';

// Add analysis
AnalysisHistoryService.addAnalysis({
  prediction: 'Fake',
  confidence: 95,
  summary: 'Analysis complete'
});

// Get history
const history = AnalysisHistoryService.getHistory();

// Get statistics
const stats = AnalysisHistoryService.getStatistics();

// Clear history
AnalysisHistoryService.clearHistory();
```

## 🎨 Theme Variables (CSS)

```css
/* Available in both dark and light mode */
--bg-primary        /* Main background */
--bg-secondary      /* Secondary background */
--text-primary      /* Main text */
--text-secondary    /* Secondary text */
--border-color      /* Border color */
--glass-bg          /* Glass effect background */
--shadow-color      /* Shadow color */
```

## 📊 Analysis History Object

```javascript
{
  id: 'analysis_1701234567890',
  timestamp: '2024-01-15T10:30:00Z',
  date: '1/15/2024',
  time: '10:30:00 AM',
  prediction: 'Fake',
  confidence: 95,
  processingTime: 2340,
  summary: 'AI analysis summary...',
  image: 'base64-or-url'
}
```

## 🔐 Protected Routes Example

```jsx
<Route
  path="/history"
  element={
    <ProtectedRoute>
      <History />
    </ProtectedRoute>
  }
/>
```

## 🎭 Theme Application

Themes applied via CSS classes on root element:
- Default: No class (dark theme)
- Light: `html.light-theme` class added
- All elements automatically update via CSS variables

## 📱 Responsive Design

All new features are fully responsive:
- Desktop: Full layout
- Tablet: Optimized spacing
- Mobile: Stack layout, touch-friendly buttons

## 🔄 User Flow

```
LOGIN PAGE
    ↓
[Signup] [Login] [Guest]
    ↓
DASHBOARD
    ├→ Upload & Analyze
    ├→ View Results (auto-saved to history)
    ├→ Access via user menu:
    │   ├→ Profile (/profile)
    │   ├→ History (/history)
    │   ├→ Settings (/settings)
    │   └→ Logout (→ /login)
    └→ Theme toggle (navbar)
```

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Routes not working | Ensure react-router-dom installed |
| Theme not persisting | Check localStorage is enabled |
| Auth not working | Clear localStorage and refresh |
| Context undefined | Ensure providers wrap App component |

## 📦 Dependencies Added

```json
{
  "react-router-dom": "^6.20.0"
}
```

## ✅ Pre-deployment Checklist

- [ ] Install dependencies: `npm install`
- [ ] Test login/signup flows
- [ ] Test theme toggle
- [ ] Test analysis history
- [ ] Build project: `npm run build`
- [ ] Clear localStorage to test fresh
- [ ] Test guest login
- [ ] Verify settings page
- [ ] Check responsive design

## 🎯 Exposed APIs

### AnalysisHistoryService Methods
```
.addAnalysis(analysis)
.getHistory()
.getAnalysisById(id)
.deleteAnalysis(id)
.clearHistory()
.exportHistory()
.getStatistics()
```

### AuthContext Methods
```
.login(email, password)
.signup(name, email, password)
.loginAsGuest()
.logout()
```

### ThemeContext Methods
```
.toggleTheme()
.applyTheme(newTheme)
```

---

**Version**: 1.0.0  
**Last Updated**: June 2024  
**Status**: Production Ready ✅
