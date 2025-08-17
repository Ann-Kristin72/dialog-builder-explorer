import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {/* TeknoTassen avatar kan legges til her */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              🦉
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Velkommen til TeknoTassen
          </CardTitle>
          <CardDescription className="text-gray-600">
            Din vennlige velferdsteknologi ekspert
          </CardDescription>
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
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
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
                <span>Logg inn med Azure AD</span>
              </div>
            )}
          </Button>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Du vil bli omdirigert til Microsoft Azure AD B2C</p>
            <p>for sikker autentisering</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Aula Notice - Privacy Policy */}
      <AulaNotice />
    </div>
  );
};

export default Login;
