import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, Save, Play, Square, Terminal as TerminalIcon, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAutomationStatus, useStartAutomation, useStopAutomation, useLatestConfig, useSaveConfig } from "@/hooks/use-automation";
import { CyberCard } from "@/components/CyberCard";
import { CyberButton } from "@/components/CyberButton";
import { CyberInput, CyberTextarea } from "@/components/CyberInput";
import { Terminal } from "@/components/Terminal";
import { configs } from "@shared/schema";

// Form Schema
const formSchema = z.object({
  token: z.string().min(1, "Discord user token is required"),
  message: z.string().min(1, "Message content is required"),
  channelIds: z.string().min(1, "At least one channel ID is required"),
  delaySeconds: z.coerce.number().min(5, "Minimum delay is 5 seconds").max(3600, "Maximum delay is 3600 seconds"),
});

type FormData = z.infer<typeof formSchema>;

export default function Dashboard() {
  const [showToken, setShowToken] = useState(false);
  
  // Queries & Mutations
  const { data: statusData } = useAutomationStatus();
  const { data: configData, isLoading: isLoadingConfig } = useLatestConfig();
  const startMutation = useStartAutomation();
  const stopMutation = useStopAutomation();
  const saveMutation = useSaveConfig();

  const isRunning = statusData?.isRunning ?? false;
  const logs = statusData?.logs ?? [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "",
      message: "",
      channelIds: "",
      delaySeconds: 60,
    },
  });

  // Populate form when config loads
  useEffect(() => {
    if (configData) {
      form.reset({
        token: configData.token,
        message: configData.message,
        channelIds: configData.channelIds,
        delaySeconds: configData.delaySeconds,
      });
    }
  }, [configData, form]);

  const handleStart = async (data: FormData) => {
    // Parse channel IDs
    const channelIdArray = data.channelIds.split(",").map(id => id.trim()).filter(id => id.length > 0);
    
    if (channelIdArray.length === 0) {
      form.setError("channelIds", { message: "Invalid channel IDs format" });
      return;
    }

    startMutation.mutate({
      token: data.token,
      message: data.message,
      channelIds: channelIdArray,
      delaySeconds: data.delaySeconds,
    });
  };

  const handleStop = () => {
    stopMutation.mutate();
  };

  const handleSave = (data: FormData) => {
    saveMutation.mutate({
      token: data.token,
      message: data.message,
      channelIds: data.channelIds,
      delaySeconds: data.delaySeconds,
      name: "User Config", // Default name for now
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="scanline" />
      <div className="crt-flicker" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/20 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary animate-pulse tracking-tighter">
              AUTO_SENDER_V1
            </h1>
            <p className="text-primary/60 font-mono text-xs md:text-sm mt-2 tracking-widest uppercase">
              // Discord Automation Protocol // User Level: Admin
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-black/40 p-2 rounded border border-white/5">
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground font-mono uppercase">System Status</div>
              <div className={cn(
                "text-sm font-bold font-display tracking-widest",
                isRunning ? "text-primary text-glow" : "text-muted-foreground"
              )}>
                {isRunning ? "ACTIVE" : "STANDBY"}
              </div>
            </div>
            <div className={cn(
              "w-2 h-10 w-1",
              isRunning ? "bg-primary shadow-[0_0_10px_rgba(0,255,128,0.8)] animate-pulse" : "bg-muted"
            )} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-6">
            <CyberCard 
              title="CONFIGURATION_MATRIX" 
              className="h-full" 
              variant="default"
            >
              <form className="space-y-6">
                
                {/* Token Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <CyberInput
                      label="ACCESS_TOKEN"
                      type={showToken ? "text" : "password"}
                      placeholder="Enter user token..."
                      error={form.formState.errors.token?.message}
                      {...form.register("token")}
                      disabled={isRunning}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-9 text-primary/50 hover:text-primary transition-colors"
                    >
                      {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 font-mono italic">
                    * Token is stored locally in encrypted storage.
                  </p>
                </div>

                {/* Message Input */}
                <CyberTextarea
                  label="PAYLOAD_CONTENT"
                  placeholder="Type your message here..."
                  rows={5}
                  error={form.formState.errors.message?.message}
                  {...form.register("message")}
                  disabled={isRunning}
                />

                {/* Channel IDs */}
                <CyberTextarea
                  label="TARGET_CHANNELS"
                  placeholder="123456789, 987654321, ..."
                  rows={3}
                  helperText="Separate multiple IDs with commas"
                  error={form.formState.errors.channelIds?.message}
                  {...form.register("channelIds")}
                  disabled={isRunning}
                />

                {/* Delay Slider */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-display font-bold text-primary/80 uppercase tracking-widest">
                      LOOP_INTERVAL (SEC)
                    </label>
                    <span className="font-mono text-primary text-sm font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {form.watch("delaySeconds")}s
                    </span>
                  </div>
                  <Controller
                    name="delaySeconds"
                    control={form.control}
                    render={({ field }) => (
                      <input
                        type="range"
                        min="5"
                        max="3600"
                        step="1"
                        className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer border border-white/10 accent-primary"
                        {...field}
                        disabled={isRunning}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <CyberButton 
                    type="button"
                    variant="secondary"
                    className="w-full col-span-2"
                    onClick={form.handleSubmit(handleSave)}
                    isLoading={saveMutation.isPending}
                    disabled={isRunning}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    SAVE_CONFIG
                  </CyberButton>

                  <CyberButton
                    type="button"
                    variant="primary"
                    className="w-full"
                    onClick={form.handleSubmit(handleStart)}
                    isLoading={startMutation.isPending}
                    disabled={isRunning}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    INITIATE
                  </CyberButton>

                  <CyberButton
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={handleStop}
                    disabled={!isRunning || stopMutation.isPending}
                  >
                    <Square className="w-4 h-4 mr-2 fill-current" />
                    ABORT
                  </CyberButton>
                </div>
              </form>
            </CyberCard>
          </div>

          {/* Right Column: Terminal */}
          <div className="lg:col-span-7 h-[600px] lg:h-auto min-h-[500px]">
             <Terminal logs={logs} isRunning={isRunning} />
          </div>

        </div>
      </div>
    </div>
  );
}
