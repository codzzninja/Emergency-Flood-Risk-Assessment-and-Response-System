// Import core React libraries
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import routing logic from the app
import AppRoutes from './routes';

// Import authentication context provider to manage global auth state
import { AuthProvider } from './context/AuthContext';

// Import global CSS styles
import './index.css';

// Create a root for React to render into (using React 18+ createRoot API)
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app wrapped in React.StrictMode and AuthProvider
root.render(
  <React.StrictMode>
    {/* Provide global authentication state to all child components */}
    <AuthProvider>
      {/* Define all application routes */}
      <AppRoutes />
    </AuthProvider>
  </React.StrictMode>
);
