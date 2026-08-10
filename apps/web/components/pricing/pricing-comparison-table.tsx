import { CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PricingComparisonTable() {
  const features = [
    { name: "Demo Generations", free: "2", pro: "10", growth: "50" },
    { name: "Watermark Removal", free: false, pro: true, growth: true },
    { name: "HD Exports", free: false, pro: true, growth: true },
    { name: "Rendering Speed", free: "Standard", pro: "Faster", growth: "Fast" },
    { name: "Priority Support", free: false, pro: true, growth: true },
    { name: "Early Feature Access", free: false, pro: false, growth: true },
  ];

  return (
    <div className="w-full overflow-x-auto mt-12 mb-24">
      <div className="min-w-[600px]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-1/4 text-left font-medium text-foreground">Feature</TableHead>
              <TableHead className="w-1/4 text-center font-medium text-foreground">Free</TableHead>
              <TableHead className="w-1/4 text-center font-medium text-foreground">Pro</TableHead>
              <TableHead className="w-1/4 text-center font-medium text-foreground">Growth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature, idx) => (
              <TableRow key={idx} className="hover:bg-surface/50 border-border/40">
                <TableCell className="font-medium">{feature.name}</TableCell>
                <TableCell className="text-center">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? <CheckCircle2 className="w-5 h-5 mx-auto text-primary" /> : <span className="text-muted-foreground">-</span>
                  ) : (
                    feature.free
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {typeof feature.pro === 'boolean' ? (
                    feature.pro ? <CheckCircle2 className="w-5 h-5 mx-auto text-primary" /> : <span className="text-muted-foreground">-</span>
                  ) : (
                    feature.pro
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {typeof feature.growth === 'boolean' ? (
                    feature.growth ? <CheckCircle2 className="w-5 h-5 mx-auto text-primary" /> : <span className="text-muted-foreground">-</span>
                  ) : (
                    feature.growth
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
