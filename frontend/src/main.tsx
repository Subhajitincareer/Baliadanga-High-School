import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// 1. Identify the root element
const rootElement = document.getElementById('root');

// 2. Production Safety Check
if (!rootElement) {
  // In a real production app, you might send this to an error logging service like Sentry
  console.error("Failed to find the root element. The application cannot start.");
  
  // Render a "Static" emergency message if the React tree can't mount
  const body = document.querySelector('body');
  if (body) {
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; text-align: center; background: #f8fafc; color: #1e293b;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">System Error</h1>
        <p style="font-size: 1.1rem; max-width: 500px; line-height: 1.6;">
          The application failed to initialize properly. This could be due to a script loading error or a browser compatibility issue.
        </p>
        <button onclick="window.location.reload()" style="margin-top: 2rem; padding: 0.75rem 1.5rem; background: #1a4d7c; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
          Refresh Page
        </button>
      </div>
    `;
  }
} else {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // 3. Remove the initial UI loader after hydration begins
  const loader = document.getElementById('loader-wrapper');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 500);
  }
}
