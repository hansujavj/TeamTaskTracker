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

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserDomain(id: number, domain: string): Promise<User | undefined>;
  getUsersByDomain(domain: string): Promise<User[]>;
  
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private domains: Map<number, Domain>;
  private tasks: Map<number, Task>;
  private currentUserId: number;
  private currentDomainId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.domains = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentDomainId = 1;
    this.currentTaskId = 1;

    // Initialize with default data
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default team lead
    const teamLead = await this.createUser({
      name: "John Doe",
      email: "lead@example.com",
      password: "password123",
      role: "lead",
      preferredDomain: null,
    });

    // Create default domains
    const designDomain = await this.createDomain({
      name: "Design",
      description: "UI/UX design, prototyping, and visual assets",
      createdBy: teamLead.id,
    });

    const devDomain = await this.createDomain({
      name: "Development",
      description: "Frontend and backend development tasks",
      createdBy: teamLead.id,
    });

    const researchDomain = await this.createDomain({
      name: "Research",
      description: "Market research and user studies",
      createdBy: teamLead.id,
    });

    // Create default team members
    await this.createUser({
      name: "Sarah Wilson",
      email: "sarah@example.com",
      password: "password123",
      role: "member",
      preferredDomain: "Design",
    });

    await this.createUser({
      name: "Mike Chen",
      email: "mike@example.com",
      password: "password123",
      role: "member",
      preferredDomain: "Development",
    });

    await this.createUser({
      name: "Lisa Park",
      email: "lisa@example.com",
      password: "password123",
      role: "member",
      preferredDomain: "Research",
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      preferredDomain: insertUser.preferredDomain ?? null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserDomain(id: number, domain: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, preferredDomain: domain };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getUsersByDomain(domain: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.preferredDomain === domain);
  }

  async getDomains(): Promise<Domain[]> {
    return Array.from(this.domains.values());
  }

  async createDomain(insertDomain: InsertDomain): Promise<Domain> {
    const id = this.currentDomainId++;
    const domain: Domain = { 
      ...insertDomain, 
      id,
      description: insertDomain.description ?? null
    };
    this.domains.set(id, domain);
    return domain;
  }

  async getDomainByName(name: string): Promise<Domain | undefined> {
    return Array.from(this.domains.values()).find(domain => domain.name === name);
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.assignedTo === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getTasksByDomain(domain: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.domain === domain)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      description: insertTask.description ?? null,
      status: insertTask.status ?? 'pending',
      assignedTo: insertTask.assignedTo ?? null,
      priority: insertTask.priority ?? 'medium',
      createdAt: new Date(),
      completedAt: null 
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTaskStatus(id: number, status: string, completedAt?: Date): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (task) {
      const updatedTask = { 
        ...task, 
        status, 
        completedAt: status === 'completed' ? (completedAt || new Date()) : null 
      };
      this.tasks.set(id, updatedTask);
      return updatedTask;
    }
    return undefined;
  }

  async updateTaskAssignment(id: number, assignedTo: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (task) {
      const updatedTask = { ...task, assignedTo };
      this.tasks.set(id, updatedTask);
      return updatedTask;
    }
    return undefined;
  }

  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return Array.from(this.tasks.values()).filter(task => 
      task.status === 'pending' && new Date(task.deadline) < now
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
}

export const storage = new MemStorage();
