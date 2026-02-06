import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";
import { CyberButton } from "@/components/CyberButton";
import { CyberCard } from "@/components/CyberCard";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="scanline" />
      <div className="crt-flicker" />
      
      <CyberCard variant="danger" className="max-w-md w-full text-center py-12 border-destructive/50">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center border-2 border-destructive animate-pulse shadow-[0_0_30px_-5px_rgba(255,0,0,0.4)]">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-4xl font-display font-black text-destructive mb-2 tracking-widest">404 ERROR</h1>
        <p className="text-xl font-mono text-destructive/80 mb-8 uppercase tracking-widest">Signal Lost</p>
        
        <div className="text-muted-foreground font-mono text-sm mb-8 space-y-2">
          <p>The requested data packet could not be located.</p>
          <p>Please return to the main console.</p>
        </div>

        <Link href="/">
          <CyberButton variant="destructive" className="w-full max-w-[200px]">
            RETURN_HOME
          </CyberButton>
        </Link>
      </CyberCard>
    </div>
  );
}
