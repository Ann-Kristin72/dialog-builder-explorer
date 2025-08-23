import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Shield, Brain, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo og navn */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-avatar">
              <img 
                src="/teknotassen-avatar.jpg" 
                alt="TeknoTassen"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TeknoTassen</h1>
              <p className="text-sm text-muted-foreground">Velferdsteknologi AI-Assistent</p>
            </div>
          </div>

          {/* Brukerinfo eller Login-knapp */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Rolle badge */}
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground capitalize">
                    {user.role || 'Bruker'}
                  </span>
                </div>

                {/* Organisasjon */}
                {user.organization && (
                  <div className="hidden md:block text-sm text-muted-foreground">
                    {user.organization}
                  </div>
                )}

                {/* Bruker avatar og dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={`${user.givenName} ${user.surname}`} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                          {user.givenName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.givenName} {user.surname}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Innstillinger</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logg ut</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Login-knapp når ikke autentisert */
              <Button
                onClick={handleLogin}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-sm"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Logg inn igjen
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
