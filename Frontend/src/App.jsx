import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import AppRoutes from './routes/index.jsx';
import GlobalStyles from './components/GlobalStyles/index.jsx';
import './styles/main.scss';

import { LanguageProvider } from './contexts/LanguageContext.jsx';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <GlobalStyles>
            <Router>
              <AppRoutes />
            </Router>
          </GlobalStyles>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

