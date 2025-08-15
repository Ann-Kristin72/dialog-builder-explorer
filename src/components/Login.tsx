import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, Users, Brain, Zap } from "lucide-react";

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    await login();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <CardTitle>Logger inn...</CardTitle>
            <CardDescription>
              Henter brukerinformasjon
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <Brain className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            Velkommen til TeknoTassen
          </CardTitle>
          
          <CardDescription className="text-gray-600">
            Din intelligente assistent for velferdsteknologi
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Funksjoner */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Sikker innlogging med Azure AD / ID-porten</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Rollebasert tilgang og brukerstyring</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>AI-drevet veiledning og sjekklister</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Integrasjon med Teams, SharePoint og intranett</span>
            </div>
          </div>

          {/* Login knapp */}
          <Button 
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Shield className="mr-2 h-5 w-5" />
            Logg inn med organisasjon
          </Button>

          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Du vil bli omdirigert til din organisasjons innloggingsside
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
