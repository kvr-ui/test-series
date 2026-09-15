import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// The admin dashboard is its own bundle and skips the landing page's content fetch, header and footer
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const isDashboard = /^\/dashboard\/?$/.test(window.location.pathname);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isDashboard ? (
      <Suspense fallback={null}>
        <Dashboard />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
