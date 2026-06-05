import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Create context references for non-hook access
import { createContext } from 'react';

// Dummy contexts to be populated by providers
window.authContext = null;
window.themeContext = null;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)