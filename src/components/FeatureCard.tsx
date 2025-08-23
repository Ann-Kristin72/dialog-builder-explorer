import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  accentColor: "blue" | "green" | "orange" | "tech-blue" | "tech-green" | "tech-orange";
}

export const FeatureCard = ({ icon, title, description, accentColor }: FeatureCardProps) => {
  const borderColorClass = {
    blue: "border-primary/30",
    green: "border-primary/30", 
    orange: "border-primary/30",
    "tech-blue": "border-primary/30",
    "tech-green": "border-primary/30",
    "tech-orange": "border-primary/30"
  }[accentColor];

  const iconColorClass = {
    blue: "text-primary",
    green: "text-primary",
    orange: "text-primary",
    "tech-blue": "text-primary",
    "tech-green": "text-primary",
    "tech-orange": "text-primary"
  }[accentColor];

  return (
    <Card className={`bg-muted/50 shadow-card border-2 ${borderColorClass} hover:shadow-soft transition-smooth hover:-translate-y-1`}>
      <CardContent className="p-8 text-center">
        <div className={`w-16 h-16 mx-auto mb-6 flex items-center justify-center ${iconColorClass}`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};