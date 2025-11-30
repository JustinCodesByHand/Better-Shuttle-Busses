import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MapPage from './pages/MapPage';
import AlertsSettingsPage from './pages/AlertsSettingsPage';
import OfflineFallbackPage from './pages/OfflineFallbackPage';
import Header from './components/layout/Header';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';



function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/" replace />;
    }
    return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app-root">
        <Header />
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AlertsSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offline"
            element={
              <ProtectedRoute>
                <OfflineFallbackPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}
