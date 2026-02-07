import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import fetch from "node-fetch";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

const upload = multer({
  storage: multer.diskStorage({
    destination: "client/public/uploads/",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

// Ensure upload directory exists
if (!fs.existsSync("client/public/uploads/")) {
  fs.mkdirSync("client/public/uploads/", { recursive: true });
}

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

  getStatus() {
    return { isRunning: this.isRunning, logs: this.logs };
  }

  addLog(type: 'info' | 'success' | 'error', message: string) {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      type,
      message
    };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) this.logs.shift();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.addLog('info', 'Automation stopped.');
  }

  start(token: string, message: string, channelIds: string[], delaySeconds: number, imageUrls: string[] = []) {
    if (this.isRunning) this.stop();
    this.isRunning = true;
    this.logs = [];
    this.addLog('info', `Starting automation. Delay: ${delaySeconds}s. Channels: ${channelIds.length}`);

    const runLoop = async () => {
      if (!this.isRunning) return;
      this.addLog('info', `Executing cycle...`);
      
      for (const channelId of channelIds) {
        if (!this.isRunning) break;
        try {
          // Attempt with images first if any
          let success = false;
          if (imageUrls.length > 0) {
            // In a real scenario, we'd use FormData to send files to Discord.
            // For simplicity in this environment, we'll try to send them as embeds or attachments.
            // User token "self-botting" often uses a specific JSON structure.
            const response = await fetch(`https://discord.com/api/v9/channels/${channelId.trim()}/messages`, {
              method: 'POST',
              headers: { 'Authorization': token, 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                content: message,
                embeds: imageUrls.map(url => ({ image: { url: `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co${url}` } }))
              })
            });

            if (response.ok) {
              this.addLog('success', `Sent to ${channelId} with images`);
              success = true;
            } else {
              const errData: any = await response.json().catch(() => ({}));
              if (errData.code === 50013 || response.status === 403) {
                this.addLog('info', `No image permission in ${channelId}. Sending text only.`);
              } else {
                this.addLog('error', `Image send failed in ${channelId}: ${response.status}`);
              }
            }
          }

          if (!success) {
            const response = await fetch(`https://discord.com/api/v9/channels/${channelId.trim()}/messages`, {
              method: 'POST',
              headers: { 'Authorization': token, 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: message })
            });
            if (response.ok) {
              this.addLog('success', `Sent text to ${channelId}`);
            } else {
              this.addLog('error', `Failed ${channelId}: ${response.status}`);
            }
          }
        } catch (error: any) {
          this.addLog('error', `Error ${channelId}: ${error.message}`);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    };

    runLoop();
    this.intervalId = setInterval(runLoop, delaySeconds * 1000);
  }
}

const automation = new AutomationManager();

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use("/uploads", express.static("client/public/uploads"));

  app.get(api.configs.list.path, async (req, res) => {
    res.json(await storage.getAllConfigs());
  });

  app.get(api.configs.get.path, async (req, res) => {
    const config = await storage.getConfig(Number(req.params.id));
    if (!config) return res.status(404).json({ message: "Not found" });
    res.json(config);
  });

  app.post(api.configs.save.path, async (req, res) => {
    try {
      const input = api.configs.save.input.parse(req.body);
      res.json(await storage.saveConfig(input));
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete(api.configs.delete.path, async (req, res) => {
    await storage.deleteConfig(Number(req.params.id));
    res.status(204).end();
  });

  app.post(api.upload.images.path, upload.array("images"), (req, res) => {
    const files = req.files as Express.Multer.File[];
    const urls = files.map(f => `/uploads/${f.filename}`);
    res.json({ urls });
  });

  app.post(api.automation.start.path, (req, res) => {
    try {
      const input = api.automation.start.input.parse(req.body);
      automation.start(input.token, input.message, input.channelIds, input.delaySeconds, input.imageUrls);
      res.json({ message: "Started" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post(api.automation.stop.path, (req, res) => {
    automation.stop();
    res.json({ message: "Stopped" });
  });

  app.get(api.automation.status.path, (req, res) => {
    res.json(automation.getStatus());
  });

  return httpServer;
}
