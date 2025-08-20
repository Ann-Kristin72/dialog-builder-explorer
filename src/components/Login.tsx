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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-accent p-4 sm:p-6">
      <Card className="w-full max-w-lg shadow-card">
        <CardHeader className="text-center p-4 sm:p-6">
          <div className="mx-auto mb-4">
            {/* TeknoTassen avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-avatar border-4 border-white">
              <img 
                src="/teknotassen-avatar.jpg" 
                alt="TeknoTassen AI Assistent"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Velkommen til TeknoTassen
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Din vennlige velferdsteknologi ekspert
          </CardDescription>
          <div className="mt-2">
            <Badge variant="secondary" className="bg-tech-blue/10 text-tech-blue border-tech-blue/20">
              🔧 Demo Mode
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Onboarding Overview */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Hva kan jeg hjelpe deg med? 🚀
            </h3>
            <div className="grid grid-cols-1 gap-3 text-left">
              <div className="flex items-start space-x-3 p-3 bg-tech-blue/5 rounded-lg border border-tech-blue/20">
                <div className="w-8 h-8 bg-tech-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-tech-blue text-lg">🏥</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground">HEPRO Respons</h4>
                  <p className="text-sm text-muted-foreground">Implementering og bruk av HEPRO Respons systemet</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-tech-green/5 rounded-lg border border-tech-green/20">
                <div className="w-8 h-8 bg-tech-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-tech-green text-lg">🌙</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground">Digital Nattilsyn</h4>
                  <p className="text-sm text-muted-foreground">Digitale løsninger for nattilsyn og overvåking</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-tech-orange/5 rounded-lg border border-tech-orange/20">
                <div className="w-8 h-8 bg-tech-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-tech-orange text-lg">💙</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground">Varda Care</h4>
                  <p className="text-sm text-muted-foreground">Opplæring og bruk av Varda Care systemet</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary text-lg">📚</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground">Aula</h4>
                  <p className="text-sm text-muted-foreground">Læringsplattform og kursadministrasjon</p>
                </div>
              </div>
            </div>
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
          
          <div className="text-center text-xs text-muted-foreground mt-4">
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
