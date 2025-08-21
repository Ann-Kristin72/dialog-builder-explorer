import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import AulaNotice from './AulaNotice';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    workplace: '',
    department: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    try {
      // Her kan vi lagre brukerdata før login
      console.log('👤 Brukerdata:', formData);
      console.log('🎯 Rolle:', formData.role);
      console.log('🏥 Avdeling:', formData.department);
      await login();
    } catch (error) {
      console.error('❌ Login failed:', error);
    }
  };

  const isFormValid = formData.name && formData.email && formData.role && formData.workplace && formData.department;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-accent p-4 sm:p-6">
      <Card className="w-full max-w-xl shadow-card">
        <CardHeader className="text-center p-4 sm:p-6">
          <div className="mx-auto mb-6">
            {/* TeknoTassen avatar */}
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-avatar border-4 border-white">
              <img 
                src="/teknotassen-avatar.jpg" 
                alt="TeknoTassen AI Assistent"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Velkomstmelding */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-card-foreground">
              Hei, jeg heter TeknoTassen! 👋
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Jeg er din vennlige AI-assistent som skal hjelpe deg med teknologi og velferdsteknologi. 
              Men først trenger jeg at du logger deg inn - da sees vi på innsiden!
            </p>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-tech-green/10 text-tech-green border-tech-green/20">
                🔧 Demo Mode
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Login Form */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-card-foreground text-center">
              Fortell meg litt om deg selv
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-card-foreground">
                  Navn
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ditt navn"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                  E-postadresse
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="din.epost@eksempel.no"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-card-foreground">
                  Rolle
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Velg din rolle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prosjektleder">Prosjektleder i velferdsteknologi</SelectItem>
                    <SelectItem value="helsearbeider">Helsearbeider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="workplace" className="text-sm font-medium text-card-foreground">
                  Hvor jobber du?
                </Label>
                <Input
                  id="workplace"
                  type="text"
                  placeholder="Navn på arbeidsplass"
                  value={formData.workplace}
                  onChange={(e) => handleInputChange('workplace', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="department" className="text-sm font-medium text-card-foreground">
                  Avdeling/Seksjon
                </Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="F.eks. Omsorg, Sykepleie, IT"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleLogin}
            disabled={isLoading || !isFormValid}
            className="w-full bg-gradient-to-r from-primary to-tech-blue hover:from-primary/90 hover:to-tech-blue/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-smooth transform hover:scale-105 shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span>Logg inn</span>
            </div>
            )}
          </Button>
          
          <div className="text-center text-xs text-muted-foreground mt-4">
            <p>🔧 Demo mode: Fyll ut alle 5 feltene for å aktivere "Logg inn"</p>
            <p>TeknoTassen vil veilede deg gjennom hele prosessen når du logger inn!</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Aula Notice - Privacy Policy */}
      <AulaNotice />
    </div>
  );
};

export default Login;
