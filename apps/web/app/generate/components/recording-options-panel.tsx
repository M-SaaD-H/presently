import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { RecordingOptions } from "@presently/shared";
import { Info } from "lucide-react";

interface RecordingOptionsPanelProps {
  options: RecordingOptions;
  onChange: (options: RecordingOptions) => void;
  disabled?: boolean;
}

export function RecordingOptionsPanel({ options, onChange, disabled }: RecordingOptionsPanelProps) {
  const updateOption = (key: keyof RecordingOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const updateViewport = (key: keyof RecordingOptions["viewport"], value: number) => {
    onChange({ ...options, viewport: { ...options.viewport, [key]: value } });
  };

  const updateScroll = (key: keyof RecordingOptions["scroll"], value: number) => {
    onChange({ ...options, scroll: { ...options.scroll, [key]: value } });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 w-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="space-y-1">
              <Label>Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Enable dark mode theme</p>
            </div>
            <Switch
              checked={options.enableDarkMode}
              onCheckedChange={(checked) => updateOption("enableDarkMode", checked)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="space-y-1">
              <Label>Browser Frame</Label>
              <p className="text-xs text-muted-foreground">Include a browser window frame</p>
            </div>
            <Switch
              checked={options.showBrowserFrame}
              onCheckedChange={(checked) => updateOption("showBrowserFrame", checked)}
              disabled={disabled}
            />
          </div>
        </div>

        <Accordion className="w-full">
          <AccordionItem className="border border-border/50 rounded-lg px-4 bg-surface/30 data-[state=open]:bg-surface/50 transition-colors">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="font-semibold text-foreground">Advanced Recording Options</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-2 pb-6">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Viewport Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Width (px)</Label>
                    <Input
                      type="number"
                      value={options.viewport.width}
                      onChange={(e) => updateViewport("width", parseInt(e.target.value) || 0)}
                      disabled={disabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height (px)</Label>
                    <Input
                      type="number"
                      value={options.viewport.height}
                      onChange={(e) => updateViewport("height", parseInt(e.target.value) || 0)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scroll Timings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label>Top Pause (ms)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Milliseconds to pause at top before scrolling (lets opening animations play)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={options.scroll.pauseAtTopMs}
                      onChange={(e) => updateScroll("pauseAtTopMs", parseInt(e.target.value) || 0)}
                      disabled={disabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label>Bottom Pause (ms)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Milliseconds to pause at bottom after scrolling</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={options.scroll.pauseAtBottomMs}
                      onChange={(e) => updateScroll("pauseAtBottomMs", parseInt(e.target.value) || 0)}
                      disabled={disabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label>Settle Time (ms)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Extra settle time after page load event before scrolling starts</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={options.scroll.animationSettleMs}
                      onChange={(e) => updateScroll("animationSettleMs", parseInt(e.target.value) || 0)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>

            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </TooltipProvider>
  );
}
