import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CyberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-display font-bold text-primary/80 uppercase tracking-widest">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            className={cn(
              "w-full bg-black/20 border border-white/10 px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:border-primary/50 focus:bg-black/40 focus:shadow-[0_0_15px_-5px_rgba(0,255,128,0.3)]",
              "transition-all duration-200",
              error && "border-destructive/50 focus:border-destructive text-destructive",
              className
            )}
            {...props}
          />
          {/* Decorative corner */}
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-current opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 text-primary pointer-events-none clip-path-polygon-[100%_0,0_100%,100%_100%]" />
        </div>
        {helperText && !error && (
          <p className="text-[10px] text-muted-foreground font-mono">{helperText}</p>
        )}
        {error && (
          <p className="text-[10px] text-destructive font-mono animate-pulse">{error}</p>
        )}
      </div>
    );
  }
);
CyberInput.displayName = "CyberInput";

interface CyberTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const CyberTextarea = forwardRef<HTMLTextAreaElement, CyberTextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-display font-bold text-primary/80 uppercase tracking-widest">
            {label}
          </label>
        )}
        <div className="relative group">
          <textarea
            ref={ref}
            className={cn(
              "w-full bg-black/20 border border-white/10 px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:border-primary/50 focus:bg-black/40 focus:shadow-[0_0_15px_-5px_rgba(0,255,128,0.3)]",
              "transition-all duration-200 min-h-[100px]",
              error && "border-destructive/50 focus:border-destructive text-destructive",
              className
            )}
            {...props}
          />
          {/* Decorative corner */}
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-primary opacity-0 group-focus-within:opacity-50 transition-opacity duration-200 pointer-events-none" />
        </div>
        {helperText && !error && (
          <p className="text-[10px] text-muted-foreground font-mono">{helperText}</p>
        )}
        {error && (
          <p className="text-[10px] text-destructive font-mono animate-pulse">{error}</p>
        )}
      </div>
    );
  }
);
CyberTextarea.displayName = "CyberTextarea";
