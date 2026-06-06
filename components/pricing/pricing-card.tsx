import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
}

export function PricingCard({ name, price, subtitle, features, cta, isPopular }: PricingCardProps) {
  return (
    <div className={cn("relative flex h-full", isPopular ? "scale-100 md:scale-105" : "")}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full z-10">
          Most Popular
        </div>
      )}
      <Card
        className={cn(
          "flex flex-col h-full w-full",
          isPopular ? "border-primary shadow-sm" : "border-border/50 bg-surface/30"
        )}
      >
        <CardHeader className="text-center pb-8 pt-8 flex-none">
          <CardTitle className="text-2xl font-medium">{name}</CardTitle>
          <CardDescription className="mt-2 min-h-[40px] flex items-center justify-center">{subtitle}</CardDescription>
          <div className="mt-6 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold tracking-tight text-foreground">{price}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className={cn("w-5 h-5", isPopular ? "text-primary" : "text-foreground/70")} />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="pt-8 pb-8 flex-none">
          <Button className="w-full h-12 text-base" variant={isPopular ? "default" : "outline"}>
            {cta}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
