import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Loader2, Eye, EyeOff, Save, Play, Square, 
  Terminal as TerminalIcon, Settings, Plus, 
  X, FolderOpen, Smartphone, Laptop, Upload,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";

import { 
  useAutomationStatus, useStartAutomation, 
  useStopAutomation, useConfigs, useSaveConfig, 
  useDeleteConfig 
} from "@/hooks/use-automation";
import { CyberCard } from "@/components/CyberCard";
import { CyberButton } from "@/components/CyberButton";
import { CyberInput, CyberTextarea } from "@/components/CyberInput";
import { Terminal } from "@/components/Terminal";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Setup name is required"),
  token: z.string().min(1, "Discord user token is required"),
  message: z.string().min(1, "Message content is required"),
  channelIds: z.string().min(1, "At least one channel ID is required"),
  delaySeconds: z.coerce.number().min(5, "Min 5s").max(3600, "Max 3600s"),
  imageUrls: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

export default function Dashboard() {
  const { toast } = useToast();
  const [showToken, setShowToken] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: statusData } = useAutomationStatus();
  const { data: configs } = useConfigs();
  const startMutation = useStartAutomation();
  const stopMutation = useStopAutomation();
  const saveMutation = useSaveConfig();
  const deleteMutation = useDeleteConfig();

  const isRunning = statusData?.isRunning ?? false;
  const logs = statusData?.logs ?? [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Default Config",
      token: "",
      message: "",
      channelIds: "",
      delaySeconds: 60,
      imageUrls: [],
    },
  });

  const handleStart = async (data: FormData) => {
    const channelIdArray = data.channelIds.split(",").map(id => id.trim()).filter(id => id.length > 0);
    startMutation.mutate({
      token: data.token,
      message: data.message,
      channelIds: channelIdArray,
      delaySeconds: data.delaySeconds,
      imageUrls: data.imageUrls,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const res = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });
      const { urls } = await res.json();
      form.setValue("imageUrls", [...form.getValues("imageUrls"), ...urls]);
      toast({ title: "Images uploaded successfully" });
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const removeImage = (index: number) => {
    const current = form.getValues("imageUrls");
    form.setValue("imageUrls", current.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-black text-primary p-4 lg:p-8 font-sans selection:bg-primary selection:text-black overflow-x-hidden">
      <div className="scanline" />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header - Mobile Responsive */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-primary/20 pb-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter animate-pulse">
              AUTO_SENDER_MOBILE_V2
            </h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="text-[10px] uppercase tracking-widest text-primary/40">// Protocol: Stable</span>
              <div className={cn("w-2 h-2 rounded-full", isRunning ? "bg-primary animate-ping" : "bg-muted")} />
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
              <DialogTrigger asChild>
                <CyberButton variant="secondary" className="flex-1 sm:flex-none py-3 h-auto">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  LOAD
                </CyberButton>
              </DialogTrigger>
              <DialogContent className="bg-black border-primary/20 text-primary">
                <DialogHeader><DialogTitle className="font-display">SAVED_CONFIGS</DialogTitle></DialogHeader>
                <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                  {configs?.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 border border-primary/10 rounded bg-white/5 hover:bg-white/10 transition-colors">
                      <button 
                        className="flex-1 text-left font-mono text-sm"
                        onClick={() => {
                          form.reset({
                            name: c.name,
                            token: c.token,
                            message: c.message,
                            channelIds: c.channelIds,
                            delaySeconds: c.delaySeconds,
                            imageUrls: c.imageUrls ? c.imageUrls.split(",") : [],
                          });
                          setLoadDialogOpen(false);
                        }}
                      >
                        {c.name}
                      </button>
                      <button onClick={() => deleteMutation.mutate(c.id)} className="text-destructive hover:scale-110 transition-transform">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {(!configs || configs.length === 0) && <p className="text-center py-8 opacity-40 font-mono text-xs">NO_CONFIGS_FOUND</p>}
                </div>
              </DialogContent>
            </Dialog>
            <CyberButton 
              variant="primary" 
              className="flex-1 sm:flex-none py-3 h-auto"
              onClick={form.handleSubmit(data => {
                saveMutation.mutate({
                  ...data,
                  channelIds: data.channelIds,
                  imageUrls: data.imageUrls.join(",")
                });
                toast({ title: "Setup Saved" });
              })}
            >
              <Save className="w-4 h-4 mr-2" />
              SAVE
            </CyberButton>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <CyberCard title="CONTROL_PANEL" className="p-4 sm:p-6">
              <form className="space-y-5">
                <CyberInput
                  label="CONFIG_NAME"
                  {...form.register("name")}
                  className="bg-black/40 h-12"
                />
                <div className="relative">
                  <CyberInput
                    label="USER_TOKEN"
                    type={showToken ? "text" : "password"}
                    {...form.register("token")}
                    className="bg-black/40 h-12 pr-12"
                  />
                  <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-4 top-9 text-primary/40">
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <CyberTextarea label="MESSAGE" rows={4} {...form.register("message")} className="bg-black/40" />
                <CyberTextarea label="TARGET_CHANNELS" rows={2} helperText="Comma separated IDs" {...form.register("channelIds")} className="bg-black/40" />
                
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold tracking-widest">
                    <span>DELAY_INTERVAL</span>
                    <span className="text-primary">{form.watch("delaySeconds")}S</span>
                  </div>
                  <input 
                    type="range" min="5" max="3600" 
                    className="w-full h-1.5 bg-primary/10 rounded-full appearance-none accent-primary cursor-pointer"
                    value={form.watch("delaySeconds")}
                    onChange={e => form.setValue("delaySeconds", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold tracking-widest uppercase">Attachments</label>
                    <CyberButton 
                      type="button" size="sm" variant="secondary" 
                      className="h-8 text-[10px]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="w-3 h-3 mr-1" /> ADD_IMG
                    </CyberButton>
                    <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {form.watch("imageUrls").map((url, i) => (
                      <div key={i} className="relative aspect-square rounded border border-primary/20 bg-black overflow-hidden group">
                        <img src={url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/80 rounded-full p-0.5 text-destructive">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <CyberButton variant="primary" className="py-4 h-auto text-sm" onClick={form.handleSubmit(handleStart)} disabled={isRunning}>
                    <Play className="w-4 h-4 mr-2" /> INITIATE
                  </CyberButton>
                  <CyberButton variant="destructive" className="py-4 h-auto text-sm" onClick={() => stopMutation.mutate()} disabled={!isRunning}>
                    <Square className="w-4 h-4 mr-2" /> ABORT
                  </CyberButton>
                </div>
              </form>
            </CyberCard>
          </div>

          <div className="lg:col-span-7 h-[400px] lg:h-auto min-h-[400px]">
            <Terminal logs={logs} isRunning={isRunning} />
          </div>
        </div>
      </div>
    </div>
  );
}
