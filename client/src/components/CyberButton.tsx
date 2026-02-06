import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
}

export const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = "primary", isLoading, size = "md", children, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-display font-bold uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background";
    
    const variants = {
      primary: "bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(0,255,128,0.5)] focus:ring-primary",
      secondary: "bg-secondary/10 text-secondary border border-secondary hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_0_20px_rgba(180,0,255,0.5)] focus:ring-secondary",
      destructive: "bg-destructive/10 text-destructive border border-destructive hover:bg-destructive hover:text-destructive-foreground hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] focus:ring-destructive",
      ghost: "text-foreground/60 hover:text-foreground hover:bg-white/5 border border-transparent",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-6 text-sm",
      lg: "h-14 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Button glint effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:animate-[shimmer_1s_infinite] pointer-events-none" />
        
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
        
        {/* Deco bits */}
        {variant !== 'ghost' && (
          <>
            <div className="absolute top-0 right-0 -mt-px -mr-px w-1 h-1 bg-current opacity-50" />
            <div className="absolute bottom-0 left-0 -mb-px -ml-px w-1 h-1 bg-current opacity-50" />
          </>
        )}
      </button>
    );
  }
);
CyberButton.displayName = "CyberButton";
