
import { createRoot } from 'react-dom/client'
import React from 'react'
import App from './App.tsx'
import './index.css'
import './App.css'

// Define window.__WS_TOKEN__ if it's not defined (fallback for production)
if (typeof window !== 'undefined' && typeof (window as any).__WS_TOKEN__ === 'undefined') {
  (window as any).__WS_TOKEN__ = 'development';
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
