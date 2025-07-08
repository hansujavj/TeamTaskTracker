import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cron from "node-cron";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertDomainSchema, 
  insertTaskSchema, 
  loginSchema,
  type User 
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthRequest extends Request {
  user?: User;
}

// JWT middleware
const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Team lead only middleware
const requireTeamLead = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'lead') {
    return res.status(403).json({ message: 'Team lead access required' });
  }
  next();
};

// Task assignment logic
const assignTaskToUser = async (domain: string): Promise<number | null> => {
  const domainUsers = await storage.getUsersByDomain(domain);
  if (domainUsers.length === 0) return null;

  // Get tasks for this domain to implement round-robin
  const domainTasks = await storage.getTasksByDomain(domain);
  const taskCounts = new Map<number, number>();
  
  // Count tasks per user
  domainUsers.forEach(user => taskCounts.set(user.id, 0));
  domainTasks.forEach(task => {
    if (task.assignedTo && taskCounts.has(task.assignedTo)) {
      taskCounts.set(task.assignedTo, taskCounts.get(task.assignedTo)! + 1);
    }
  });

  // Find user with least tasks
  let minTasks = Infinity;
  let selectedUser = null;
  for (const [userId, count] of Array.from(taskCounts.entries())) {
    if (count < minTasks) {
      minTasks = count;
      selectedUser = userId;
    }
  }

  return selectedUser;
};

// Deadline monitoring cron job
const startDeadlineMonitoring = () => {
  cron.schedule('* * * * *', async () => { // Every minute
    try {
      const overdueTasks = await storage.getOverdueTasks();
      
      for (const task of overdueTasks) {
        console.log(`Task ${task.id} is overdue, attempting reassignment...`);
        
        // Try to reassign to another user in the same domain
        const newAssignee = await assignTaskToUser(task.domain);
        if (newAssignee && newAssignee !== task.assignedTo) {
          await storage.updateTaskAssignment(task.id, newAssignee);
          console.log(`Task ${task.id} reassigned to user ${newAssignee}`);
        }
      }
    } catch (error) {
      console.error('Error in deadline monitoring:', error);
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Registration failed' });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Login failed' });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    const { password, ...userWithoutPassword } = req.user!;
    res.json({ user: userWithoutPassword });
  });

  // Domain routes
  app.get("/api/domains", authenticateToken, async (req, res) => {
    try {
      const domains = await storage.getDomains();
      res.json(domains);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch domains' });
    }
  });

  app.post("/api/domains", authenticateToken, requireTeamLead, async (req: AuthRequest, res) => {
    try {
      const domainData = insertDomainSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const domain = await storage.createDomain(domainData);
      res.json(domain);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create domain' });
    }
  });

  // User domain preference
  app.put("/api/users/domain", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { domain } = req.body;
      if (!domain) {
        return res.status(400).json({ message: 'Domain is required' });
      }

      const updatedUser = await storage.updateUserDomain(req.user!.id, domain);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update domain preference' });
    }
  });

  app.get("/api/users", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { domain } = req.query;
      let users: User[];
      
      if (domain) {
        users = await storage.getUsersByDomain(domain as string);
      } else {
        // Team leads can see all users, members see only themselves
        if (req.user!.role === 'lead') {
          users = await storage.getAllUsers();
        } else {
          users = [req.user!];
        }
      }
      
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Task routes
  app.get("/api/tasks", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { userId, domain } = req.query;
      let tasks;

      if (userId) {
        tasks = await storage.getTasksByUser(parseInt(userId as string));
      } else if (domain) {
        tasks = await storage.getTasksByDomain(domain as string);
      } else {
        // Team leads see all tasks, members see only their tasks
        if (req.user!.role === 'lead') {
          tasks = await storage.getTasks();
        } else {
          tasks = await storage.getTasksByUser(req.user!.id);
        }
      }

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.post("/api/tasks", authenticateToken, requireTeamLead, async (req: AuthRequest, res) => {
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        deadline: new Date(req.body.deadline),
        createdBy: req.user!.id
      });

      // Auto-assign task to a user in the domain
      const assignedTo = await assignTaskToUser(taskData.domain);
      
      const task = await storage.createTask({
        ...taskData,
        assignedTo
      });

      res.json(task);
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create task' });
    }
  });

  app.put("/api/tasks/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Members can only update their own tasks, leads can update any task
      if (req.user!.role !== 'lead' && task.assignedTo !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }

      const updatedTask = await storage.updateTaskStatus(taskId, status);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  // Stats endpoint
  app.get("/api/stats", authenticateToken, async (req: AuthRequest, res) => {
    try {
      let tasks;
      if (req.user!.role === 'lead') {
        tasks = await storage.getTasks();
      } else {
        tasks = await storage.getTasksByUser(req.user!.id);
      }

      const stats = {
        totalTasks: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'pending' && new Date(t.deadline) >= new Date()).length,
        overdue: tasks.filter(t => t.status === 'pending' && new Date(t.deadline) < new Date()).length
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // Start deadline monitoring
  startDeadlineMonitoring();

  const httpServer = createServer(app);
  return httpServer;
}
