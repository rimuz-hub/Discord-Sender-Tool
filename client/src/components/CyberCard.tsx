import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CyberCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  variant?: "primary" | "secondary" | "danger" | "default";
}

export function CyberCard({ children, className, title, variant = "default" }: CyberCardProps) {
  const borderColors = {
    default: "border-primary/30",
    primary: "border-primary",
    secondary: "border-secondary",
    danger: "border-destructive",
  };

  const glowColors = {
    default: "shadow-none",
    primary: "shadow-[0_0_15px_-3px_rgba(0,255,128,0.2)]",
    secondary: "shadow-[0_0_15px_-3px_rgba(180,0,255,0.2)]",
    danger: "shadow-[0_0_15px_-3px_rgba(255,0,0,0.2)]",
  };

  return (
    <div className={cn(
      "relative bg-card/80 backdrop-blur-sm border rounded-sm overflow-hidden",
      borderColors[variant],
      glowColors[variant],
      className
    )}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-foreground/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-foreground/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-foreground/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-foreground/50" />

      {/* Header if title present */}
      {title && (
        <div className="bg-black/40 border-b border-white/10 px-4 py-2 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold tracking-widest text-foreground/80 uppercase">
            {title}
          </h3>
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>
      )}

      <div className="p-4 md:p-6 relative z-10">
        {children}
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />
    </div>
  );
}
