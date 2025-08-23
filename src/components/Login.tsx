import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();

  const handleAzureLogin = async () => {
    try {
      console.log('🔐 Starting Azure AD B2C login...');
      await login();
    } catch (error) {
      console.error('❌ Azure AD B2C login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <Card className="w-full max-w-2xl shadow-card">
        <CardHeader className="text-center p-4 sm:p-6">
          <div className="mx-auto mb-8">
            {/* TeknoTassen avatar */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden shadow-avatar border-4 border-primary/20 transform hover:scale-105 transition-transform duration-300">
              <img 
                src="/teknotassen-avatar.jpg" 
                alt="TeknoTassen AI Assistent"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Velkomstmelding */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Velkommen tilbake til TeknoTassen! 👋
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Din AI-assistent for velferdsteknologi. Logg inn med din organisasjons konto for å fortsette.
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Azure AD B2C Login Button */}
          <div className="space-y-4">
            <Button
              onClick={handleAzureLogin}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-smooth transform hover:scale-105 shadow-soft"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  <span>Logger inn...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Logg inn med Azure AD B2C</span>
                </div>
              )}
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground mt-4">
            <p>Sikker innlogging med din organisasjons konto</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
