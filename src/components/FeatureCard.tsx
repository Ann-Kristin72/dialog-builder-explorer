import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  accentColor: "pink" | "purple" | "orange";
}

export const FeatureCard = ({ icon, title, description, accentColor }: FeatureCardProps) => {
  const borderColorClass = {
    pink: "border-medical-pink/30",
    purple: "border-medical-purple/30", 
    orange: "border-medical-orange/30"
  }[accentColor];

  const iconColorClass = {
    pink: "text-medical-pink",
    purple: "text-medical-purple",
    orange: "text-medical-orange"
  }[accentColor];

  return (
    <Card className={`bg-gradient-card shadow-card border-2 ${borderColorClass} hover:shadow-soft transition-smooth hover:-translate-y-1`}>
      <CardContent className="p-8 text-center">
        <div className={`w-16 h-16 mx-auto mb-6 flex items-center justify-center ${iconColorClass}`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-4 text-card-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};