import { db } from "./db";
import {
  configs,
  type Config,
  type InsertConfig
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllConfigs(): Promise<Config[]>;
  getConfig(id: number): Promise<Config | undefined>;
  saveConfig(config: InsertConfig): Promise<Config>;
  deleteConfig(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAllConfigs(): Promise<Config[]> {
    return await db.select().from(configs).orderBy(desc(configs.id));
  }

  async getConfig(id: number): Promise<Config | undefined> {
    const [config] = await db.select().from(configs).where(eq(configs.id, id));
    return config;
  }

  async saveConfig(insertConfig: InsertConfig): Promise<Config> {
    const [config] = await db
      .insert(configs)
      .values(insertConfig)
      .returning();
    return config;
  }

  async deleteConfig(id: number): Promise<void> {
    await db.delete(configs).where(eq(configs.id, id));
  }
}

export const storage = new DatabaseStorage();
