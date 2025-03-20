import { users, type User, type InsertUser, tuningConfigurations, type TuningConfig, type InsertTuningConfig } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tuning configurations
  getTuningConfigs(): Promise<TuningConfig[]>;
  getTuningConfig(id: number): Promise<TuningConfig | undefined>;
  createTuningConfig(config: InsertTuningConfig): Promise<TuningConfig>;
  updateTuningConfig(id: number, config: Partial<InsertTuningConfig>): Promise<TuningConfig | undefined>;
  deleteTuningConfig(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tuningConfigs: Map<number, TuningConfig>;
  private userIdCounter: number;
  private tuningIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tuningConfigs = new Map();
    this.userIdCounter = 1;
    this.tuningIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTuningConfigs(): Promise<TuningConfig[]> {
    return Array.from(this.tuningConfigs.values());
  }

  async getTuningConfig(id: number): Promise<TuningConfig | undefined> {
    return this.tuningConfigs.get(id);
  }

  async createTuningConfig(config: InsertTuningConfig): Promise<TuningConfig> {
    const id = this.tuningIdCounter++;
    const tuningConfig: TuningConfig = { ...config, id };
    this.tuningConfigs.set(id, tuningConfig);
    return tuningConfig;
  }

  async updateTuningConfig(id: number, config: Partial<InsertTuningConfig>): Promise<TuningConfig | undefined> {
    const existingConfig = this.tuningConfigs.get(id);
    if (!existingConfig) return undefined;

    const updatedConfig = { ...existingConfig, ...config };
    this.tuningConfigs.set(id, updatedConfig);
    return updatedConfig;
  }

  async deleteTuningConfig(id: number): Promise<boolean> {
    return this.tuningConfigs.delete(id);
  }
}

export const storage = new MemStorage();
