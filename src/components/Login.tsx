import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import AulaNotice from './AulaNotice';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Her kan vi legge til toast-notifikasjon senere
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-accent p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {/* TeknoTassen avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-avatar border-4 border-white">
              <img 
                src="/src/assets/teknotassen-avatar.jpg" 
                alt="TeknoTassen AI Assistent"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Velkommen til TeknoTassen
          </CardTitle>
          <CardDescription className="text-gray-600">
            Din vennlige velferdsteknologi ekspert
          </CardDescription>
          <div className="mt-2">
            <Badge variant="secondary" className="bg-tech-blue/10 text-tech-blue border-tech-blue/20">
              🔧 Demo Mode
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600 mb-6">
            <p>Logg inn med din Azure AD B2C-konto for å få tilgang til:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• HEPRO Respons implementering</li>
              <li>• Digital nattilsyn</li>
              <li>• Varda Care opplæring</li>
              <li>• GDPR og samtykkeveiledning</li>
            </ul>
          </div>
          
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-tech-blue hover:from-primary/90 hover:to-tech-blue/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-smooth transform hover:scale-105 shadow-soft"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Logger inn...</span>
              </div>
            ) : (
                          <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Demo Login</span>
            </div>
            )}
          </Button>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>🔧 Demo mode: Ingen ekstern autentisering nødvendig</p>
            <p>Trykk "Logg inn" for å komme videre</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Aula Notice - Privacy Policy */}
      <AulaNotice />
    </div>
  );
};

export default Login;
