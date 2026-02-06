import { useRef, useEffect } from "react";
import { LogEntry } from "@shared/schema";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalProps {
  logs: LogEntry[];
  isRunning: boolean;
}

export function Terminal({ logs, isRunning }: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-black/80 border border-white/10 rounded-sm overflow-hidden shadow-2xl font-mono text-xs md:text-sm">
      {/* Terminal Header */}
      <div className="bg-[#1a1a1a] border-b border-white/10 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          <span className="ml-2 text-muted-foreground font-display text-[10px] tracking-widest">
            root@discord-bot:~
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            isRunning ? "bg-primary shadow-[0_0_8px_rgba(0,255,128,0.8)]" : "bg-muted-foreground"
          )} />
          <span className={cn(
            "text-[10px] font-bold tracking-wider",
            isRunning ? "text-primary text-glow" : "text-muted-foreground"
          )}>
            {isRunning ? "SYSTEM ONLINE" : "SYSTEM IDLE"}
          </span>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-1 scroll-smooth bg-black/90 relative"
      >
        {/* CRT Scanline effect overlay for terminal specifically */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_4px,3px_100%] opacity-20" />
        
        <div className="relative z-10">
          <div className="text-muted-foreground mb-4">
            Microsoft Windows [Version 10.0.19045.3693]<br />
            (c) Microsoft Corporation. All rights reserved.<br />
            <br />
            C:\Users\Admin&gt; initialize_protocol.exe --target=discord --mode=stealth
          </div>

          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start space-x-2 font-mono leading-relaxed"
              >
                <span className="text-muted-foreground/50 select-none shrink-0">
                  [{format(new Date(log.timestamp), "HH:mm:ss")}]
                </span>
                <span className={cn(
                  "break-all",
                  log.type === 'error' ? "text-destructive font-bold" :
                  log.type === 'success' ? "text-primary" :
                  "text-foreground/80"
                )}>
                  <span className="opacity-50 mr-2 select-none">
                    {log.type === 'error' ? '>> ERR:' : 
                     log.type === 'success' ? '>> OK:' : 
                     '>> INFO:'}
                  </span>
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Active cursor line */}
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-primary select-none">{'>'}</span>
            <span className="w-2 h-4 bg-primary animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
