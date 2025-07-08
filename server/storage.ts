import { 
  users, 
  domains, 
  tasks, 
  type User, 
  type InsertUser, 
  type Domain, 
  type InsertDomain, 
  type Task, 
  type InsertTask 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, lt } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserDomain(id: number, domain: string): Promise<User | undefined>;
  getUsersByDomain(domain: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  // Domain methods
  getDomains(): Promise<Domain[]>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  getDomainByName(name: string): Promise<Domain | undefined>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTasksByUser(userId: number): Promise<Task[]>;
  getTasksByDomain(domain: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskStatus(id: number, status: string, completedAt?: Date): Promise<Task | undefined>;
  updateTaskAssignment(id: number, assignedTo: number): Promise<Task | undefined>;
  getOverdueTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if data already exists
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) return;

      const hashedPassword = await bcrypt.hash("password123", 10);

      // Create default team lead
      const [teamLead] = await db.insert(users).values({
        name: "John Doe",
        email: "lead@example.com",
        password: hashedPassword,
        role: "lead",
        preferredDomain: null,
      }).returning();

      // Create default domains
      await db.insert(domains).values([
        {
          name: "Design",
          description: "UI/UX design, prototyping, and visual assets",
          createdBy: teamLead.id,
        },
        {
          name: "Development", 
          description: "Frontend and backend development tasks",
          createdBy: teamLead.id,
        },
        {
          name: "Research",
          description: "Market research and user studies", 
          createdBy: teamLead.id,
        }
      ]);

      // Create default team members
      await db.insert(users).values([
        {
          name: "Sarah Wilson",
          email: "sarah@example.com",
          password: hashedPassword,
          role: "member",
          preferredDomain: "Design",
        },
        {
          name: "Mike Chen",
          email: "mike@example.com", 
          password: hashedPassword,
          role: "member",
          preferredDomain: "Development",
        },
        {
          name: "Lisa Park",
          email: "lisa@example.com",
          password: hashedPassword, 
          role: "member",
          preferredDomain: "Research",
        }
      ]);
    } catch (error) {
      console.log('Default data initialization skipped:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserDomain(id: number, domain: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ preferredDomain: domain })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUsersByDomain(domain: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.preferredDomain, domain));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getDomains(): Promise<Domain[]> {
    return await db.select().from(domains);
  }

  async createDomain(insertDomain: InsertDomain): Promise<Domain> {
    const [domain] = await db
      .insert(domains)
      .values(insertDomain)
      .returning();
    return domain;
  }

  async getDomainByName(name: string): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.name, name));
    return domain || undefined;
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(tasks.createdAt);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedTo, userId)).orderBy(tasks.createdAt);
  }

  async getTasksByDomain(domain: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.domain, domain)).orderBy(tasks.createdAt);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTaskStatus(id: number, status: string, completedAt?: Date): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ 
        status, 
        completedAt: status === 'completed' ? (completedAt || new Date()) : null 
      })
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async updateTaskAssignment(id: number, assignedTo: number): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ assignedTo })
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return await db.select().from(tasks).where(
      and(
        eq(tasks.status, 'pending'),
        lt(tasks.deadline, now)
      )
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }
}

export const storage = new DatabaseStorage();
