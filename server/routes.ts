import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import fetch from "node-fetch"; // Assuming node-fetch or global fetch is available. Node 18+ has global fetch.

// --- Automation Manager ---
// Keeps track of the active interval and logs
type LogEntry = {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error';
  message: string;
};

class AutomationManager {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;

  constructor() {}

  getStatus() {
    return {
      isRunning: this.isRunning,
      logs: this.logs
    };
  }

  addLog(type: 'info' | 'success' | 'error', message: string) {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      type,
      message
    };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.addLog('info', 'Automation stopped.');
  }

  start(token: string, message: string, channelIds: string[], delaySeconds: number) {
    if (this.isRunning) {
      this.stop();
    }

    this.isRunning = true;
    this.logs = []; // Clear logs on new start? Or keep history? Let's clear for fresh view.
    this.addLog('info', `Starting automation. Delay: ${delaySeconds}s. Channels: ${channelIds.length}`);

    const runLoop = async () => {
      if (!this.isRunning) return;
      
      this.addLog('info', `Executing cycle...`);
      
      for (const channelId of channelIds) {
        if (!this.isRunning) break;

        try {
          const response = await fetch(`https://discord.com/api/v9/channels/${channelId.trim()}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: message })
          });

          if (response.ok) {
            this.addLog('success', `Sent to ${channelId}`);
          } else {
            const errText = await response.text();
            this.addLog('error', `Failed ${channelId}: ${response.status} - ${errText.substring(0, 50)}...`);
            
            // If 401/403, maybe stop? For now, just log.
            if (response.status === 401) {
              this.addLog('error', 'Invalid Token. Stopping.');
              this.stop();
              return;
            }
          }
        } catch (error: any) {
          this.addLog('error', `Network error ${channelId}: ${error.message}`);
        }
        
        // Small delay between channels to avoid instant rate limits if list is huge?
        // User asked for "loop in x seconds", implies the *cycle* repeats every X seconds.
        // We shouldn't wait X seconds *between* channels.
        // But we should be careful not to spam Discord API too fast in the inner loop.
        await new Promise(r => setTimeout(r, 500)); // 500ms safety gap between channels
      }
    };

    // Run immediately once
    runLoop();

    // Then interval
    this.intervalId = setInterval(runLoop, delaySeconds * 1000);
  }
}

const automation = new AutomationManager();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // -- Config Routes --
  app.get(api.configs.get.path, async (req, res) => {
    const config = await storage.getLatestConfig();
    res.json(config || null);
  });

  app.post(api.configs.save.path, async (req, res) => {
    try {
      const input = api.configs.save.input.parse(req.body);
      const config = await storage.saveConfig(input);
      res.json(config);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // -- Automation Routes --
  app.post(api.automation.start.path, (req, res) => {
    try {
      const input = api.automation.start.input.parse(req.body);
      automation.start(input.token, input.message, input.channelIds, input.delaySeconds);
      res.json({ message: "Automation started" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal error" });
      }
    }
  });

  app.post(api.automation.stop.path, (req, res) => {
    automation.stop();
    res.json({ message: "Automation stopped" });
  });

  app.get(api.automation.status.path, (req, res) => {
    res.json(automation.getStatus());
  });

  return httpServer;
}
