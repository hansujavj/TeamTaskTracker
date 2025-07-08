import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User as UserIcon, Target, Clock, CheckCircle2 } from 'lucide-react';
import type { User, Task } from '@shared/schema';

interface UserProfileProps {
  user: User;
  tasks: Task[];
}

export default function UserProfile({ user, tasks }: UserProfileProps) {
  // Filter tasks for current user
  const userTasks = tasks.filter(task => task.assignedTo === user.id);
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const pendingTasks = userTasks.filter(task => task.status === 'pending');
  const overdueTasks = userTasks.filter(task => 
    task.status === 'pending' && new Date(task.deadline) < new Date()
  );
  
  const completionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0;
  
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          My Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Profile Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">{initials}</span>
            </div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="text-xs mt-1">
                {user.role === 'lead' ? 'Team Lead' : 'Team Member'}
              </Badge>
            </div>
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Preferred Domain</span>
            </div>
            <Badge variant={user.preferredDomain ? "default" : "outline"}>
              {user.preferredDomain || 'No domain selected'}
            </Badge>
          </div>

          {/* Task Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Task Progress</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-700">{completedTasks.length}</div>
                <div className="text-xs text-green-600">Completed</div>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-700">{pendingTasks.length}</div>
                <div className="text-xs text-blue-600">Pending</div>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <div className="text-lg font-semibold text-red-700">{overdueTasks.length}</div>
                <div className="text-xs text-red-600">Overdue</div>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          {userTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recent Tasks</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {userTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                    <span className="truncate flex-1">{task.title}</span>
                    <Badge 
                      size="sm" 
                      variant={task.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}