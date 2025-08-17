import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { IframeWrapper } from "@/components/IframeWrapper";
import { Header } from "@/components/Header";
import Login from "@/components/Login";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AulaPage from "@/pages/Aula";
import "./App.css";

// Protected route komponent
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Hovedapp komponent
const AppContent: React.FC = () => {
  return (
    <Router>
      <IframeWrapper>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Login route */}
            <Route path="/login" element={<Login />} />
            
            {/* Public routes */}
            <Route path="/aula" element={<AulaPage />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <Index />
                  </>
                </ProtectedRoute>
              }
            />
            
            {/* Auth callback routes */}
            <Route path="/auth/callback" element={<Navigate to="/" replace />} />
            <Route path="/auth/silent-renew" element={<Navigate to="/" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </IframeWrapper>
    </Router>
  );
};

// Root app komponent
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
