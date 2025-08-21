import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    workplace: '',
    department: '',
    privacyConsent: false
  });
  
  const [currentStep, setCurrentStep] = useState(0);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Ikke gå til neste steg automatisk - la brukeren fylle ut feltet først
  };

  const handleLogin = async () => {
    try {
      // Her kan vi lagre brukerdata før login
      console.log('👤 Brukerdata:', formData);
      console.log('🎯 Rolle:', formData.role);
      console.log('🏥 Avdeling:', formData.department);
      console.log('🔒 Privacy Consent:', formData.privacyConsent);
      await login();
    } catch (error) {
      console.error('❌ Login failed:', error);
    }
  };

  const isFormValid = formData.name && formData.email && formData.role && formData.workplace && formData.department && formData.privacyConsent;
  
  const formSteps = [
    { field: 'name', label: 'Navn', placeholder: 'Ditt navn', type: 'text' },
    { field: 'email', label: 'E-postadresse', placeholder: 'din.epost@eksempel.no', type: 'email' },
    { field: 'role', label: 'Rolle', placeholder: 'Velg din rolle', type: 'select' },
    { field: 'workplace', label: 'Hvor jobber du?', placeholder: 'Navn på arbeidsplass', type: 'text' },
    { field: 'department', label: 'Avdeling/Seksjon', placeholder: 'F.eks. Omsorg, Sykepleie, IT', type: 'text' },
    { field: 'privacyConsent', label: 'Personvern og databehandling', type: 'privacy' }
  ];

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
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {formSteps.map((step, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-tech-blue' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Dynamic Form Field */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-card-foreground text-center">
              {formSteps[currentStep].label}
            </h3>
            
            <div className="space-y-4">
              {formSteps[currentStep].type === 'text' && (
                <div>
                  <Label htmlFor={formSteps[currentStep].field} className="text-sm font-medium text-card-foreground">
                    {formSteps[currentStep].label}
                  </Label>
                  <Input
                    id={formSteps[currentStep].field}
                    type="text"
                    placeholder={formSteps[currentStep].placeholder}
                    value={formData[formSteps[currentStep].field as keyof typeof formData] as string}
                    onChange={(e) => handleInputChange(formSteps[currentStep].field, e.target.value)}
                    className="mt-1"
                    autoFocus
                  />
                </div>
              )}
              
              {formSteps[currentStep].type === 'email' && (
                <div>
                  <Label htmlFor={formSteps[currentStep].field} className="text-sm font-medium text-card-foreground">
                    {formSteps[currentStep].label}
                  </Label>
                  <Input
                    id={formSteps[currentStep].field}
                    type="email"
                    placeholder={formSteps[currentStep].placeholder}
                    value={formData[formSteps[currentStep].field as keyof typeof formData] as string}
                    onChange={(e) => handleInputChange(formSteps[currentStep].field, e.target.value)}
                    className="mt-1"
                    autoFocus
                  />
                </div>
              )}
              
              {formSteps[currentStep].type === 'select' && (
                <div>
                  <Label htmlFor={formSteps[currentStep].field} className="text-sm font-medium text-card-foreground">
                    {formSteps[currentStep].label}
                  </Label>
                  <Select 
                    value={formData[formSteps[currentStep].field as keyof typeof formData] as string} 
                    onValueChange={(value) => handleInputChange(formSteps[currentStep].field, value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={formSteps[currentStep].placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prosjektleder">Prosjektleder i velferdsteknologi</SelectItem>
                      <SelectItem value="helsearbeider">Helsearbeider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {formSteps[currentStep].type === 'privacy' && (
                <div className="bg-gradient-to-r from-tech-green/5 to-tech-green/10 p-4 rounded-lg border border-tech-green/20">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-tech-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-tech-green text-sm">🔒</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-card-foreground text-sm mb-2">
                        Personvern og databehandling
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Vi samler kun det som er nødvendig for kursene dine (navn, e-post, progresjon). 
                        Alt lagres trygt i EU (Azure), kryptert og beskyttet. 
                        Du har alltid rett til innsyn og sletting.
                      </p>
                      <div className="flex items-center justify-between">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          className="text-tech-green border-tech-green/30 hover:bg-green/10 text-xs"
                        >
                          Les mer →
                        </Button>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="privacy-consent"
                            checked={formData.privacyConsent}
                            onChange={(e) => handleInputChange('privacyConsent', e.target.checked)}
                            className="w-4 h-4 text-tech-green border-gray-300 rounded focus:ring-tech-green focus:ring-offset-0"
                          />
                          <Label htmlFor="privacy-consent" className="text-xs text-muted-foreground">
                            Jeg godtar personvernerklæringen
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Neste/Tilbake knapper */}
            <div className="flex justify-between pt-4">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-6"
                >
                  ← Tilbake
                </Button>
              )}
              
              {currentStep < 5 && (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={
                    (currentStep === 0 && !formData.name) ||
                    (currentStep === 1 && !formData.email) ||
                    (currentStep === 2 && !formData.role) ||
                    (currentStep === 3 && !formData.workplace) ||
                    (currentStep === 4 && !formData.department)
                  }
                  className="ml-auto px-6 bg-tech-blue hover:bg-tech-blue/90"
                >
                  Neste →
                </Button>
              )}
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
            <p>🔧 Demo mode: Fyll ut alle 6 feltene for å aktivere "Logg inn"</p>
            <p>TeknoTassen vil veilede deg gjennom hele prosessen når du logger inn!</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Privacy Policy er nå integrert i form-en */}
    </div>
  );
};

export default Login;
