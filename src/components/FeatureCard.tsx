import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  accentColor: "blue" | "green" | "orange";
}

export const FeatureCard = ({ icon, title, description, accentColor }: FeatureCardProps) => {
  const borderColorClass = {
    blue: "border-tech-blue/30",
    green: "border-tech-green/30", 
    orange: "border-tech-orange/30"
  }[accentColor];

  const iconColorClass = {
    blue: "text-tech-blue",
    green: "text-tech-green",
    orange: "text-tech-orange"
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