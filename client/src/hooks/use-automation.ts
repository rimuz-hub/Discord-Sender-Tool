import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type StartRequest, type InsertConfig } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useDeleteConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${api.configs.delete.path}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete config");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.configs.get.path] });
      toast({
        title: "CONFIG PURGED",
        description: "Configuration entry deleted successfully.",
        variant: "destructive",
        className: "font-mono border-destructive",
      });
    },
  });
}

export function useConfigs() {
  return useQuery({
    queryKey: [api.configs.get.path],
    queryFn: async () => {
      const res = await fetch(api.configs.get.path);
      if (!res.ok) throw new Error("Failed to fetch config");
      return api.configs.get.responses[200].parse(await res.json());
    },
  });
}
export function useAutomationStatus() {
  return useQuery({
    queryKey: [api.automation.status.path],
    queryFn: async () => {
      const res = await fetch(api.automation.status.path);
      if (!res.ok) throw new Error("Failed to fetch status");
      return api.automation.status.responses[200].parse(await res.json());
    },
    refetchInterval: 2000, // Poll every 2 seconds
  });
}

export function useStartAutomation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: StartRequest) => {
      // Manual validation as per schema requirements before sending if desired,
      // but relying on API response is robust.
      const res = await fetch(api.automation.start.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const errorData = await res.json();
          // Try to parse as validation error
          try {
            const validationError = api.automation.start.responses[400].parse(errorData);
            throw new Error(validationError.message);
          } catch {
             throw new Error(errorData.message || "Failed to start automation");
          }
        }
        throw new Error("Failed to start automation");
      }
      return api.automation.start.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.automation.status.path] });
      toast({
        title: "SYSTEM OVERRIDE: INITIATED",
        description: "Automation loop sequence started successfully.",
        variant: "default",
        className: "border-primary text-primary font-mono",
      });
    },
    onError: (error) => {
      toast({
        title: "ACCESS DENIED",
        description: error.message,
        variant: "destructive",
        className: "font-mono border-destructive",
      });
    },
  });
}

export function useStopAutomation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.automation.stop.path, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to stop automation");
      return api.automation.stop.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.automation.status.path] });
      toast({
        title: "SYSTEM HALTED",
        description: "Automation sequence terminated by user.",
        variant: "destructive",
        className: "font-mono border-destructive",
      });
    },
  });
}

export function useLatestConfig() {
  return useQuery({
    queryKey: [api.configs.get.path],
    queryFn: async () => {
      const res = await fetch(api.configs.get.path);
      if (!res.ok) throw new Error("Failed to fetch config");
      const data = await res.json();
      // Handle nullable response
      return api.configs.get.responses[200].parse(data);
    },
  });
}

export function useSaveConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertConfig) => {
      const validated = api.configs.save.input.parse(data);
      const res = await fetch(api.configs.save.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to save config");
      return api.configs.save.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.configs.get.path] });
      toast({
        title: "DATA UPLINK ESTABLISHED",
        description: "Configuration parameters saved to local storage matrix.",
        className: "border-secondary text-secondary font-mono",
      });
    },
    onError: () => {
      toast({
        title: "UPLOAD FAILED",
        description: "Could not save configuration parameters.",
        variant: "destructive",
      });
    }
  });
}
