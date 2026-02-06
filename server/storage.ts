import { db } from "./db";
import {
  configs,
  type Config,
  type InsertConfig
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getLatestConfig(): Promise<Config | undefined>;
  saveConfig(config: InsertConfig): Promise<Config>;
}

export class DatabaseStorage implements IStorage {
  async getLatestConfig(): Promise<Config | undefined> {
    const [config] = await db
      .select()
      .from(configs)
      .orderBy(desc(configs.id))
      .limit(1);
    return config;
  }

  async saveConfig(insertConfig: InsertConfig): Promise<Config> {
    const [config] = await db
      .insert(configs)
      .values(insertConfig)
      .returning();
    return config;
  }
}

export const storage = new DatabaseStorage();
