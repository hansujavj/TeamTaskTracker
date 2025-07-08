import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus } from 'lucide-react';
import type { User, Task } from '@shared/schema';

interface HeaderProps {
  user: User;
  onCreateTask: () => void;
  tasks?: Task[];
}

export default function Header({ user, onCreateTask, tasks = [] }: HeaderProps) {
  const isTeamLead = user.role === 'lead';
  
  // Calculate notifications based on real data
  const userTasks = tasks.filter(task => task.assignedTo === user.id);
  const overdueTasks = userTasks.filter(task => 
    task.status === 'pending' && new Date(task.deadline) < new Date()
  );
  const urgentTasks = userTasks.filter(task => 
    task.status === 'pending' && task.priority === 'urgent'
  );
  
  const notificationCount = overdueTasks.length + urgentTasks.length;

  return (
    <header className="bg-white border-b border-border px-3 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {isTeamLead 
              ? "Manage your team's tasks and track progress" 
              : "View your assigned tasks and domain preferences"
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                variant="destructive"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
          {isTeamLead && (
            <Button onClick={onCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
