import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import StatsCards from '@/components/stats-cards';
import TaskCard from '@/components/task-card';
import CreateTaskModal from '@/components/create-task-modal';
import DomainSelection from '@/components/domain-selection';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Task } from '@shared/schema';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState({ domain: 'all', status: 'all' });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: !!user,
  });

  const { data: domains = [] } = useQuery({
    queryKey: ['/api/domains'],
    enabled: !!user,
  });

  // Handle authentication redirect using useEffect
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/login');
    }
  }, [authLoading, user, setLocation]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const filteredTasks = tasks.filter((task: Task) => {
    if (taskFilter.domain !== 'all' && task.domain !== taskFilter.domain) return false;
    if (taskFilter.status !== 'all' && task.status !== taskFilter.status) return false;
    return true;
  });

  const isTeamLead = user.role === 'lead';

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} />
      
      <main className="flex-1 overflow-hidden">
        <Header 
          user={user} 
          onCreateTask={() => setIsCreateTaskOpen(true)} 
        />
        
        <div className="p-6 overflow-y-auto h-full">
          <StatsCards />
          
          {/* Quick Actions for Team Lead */}
          {isTeamLead && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-3 p-4 h-auto text-left justify-start"
                    onClick={() => setIsCreateTaskOpen(true)}
                  >
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Create Task</p>
                      <p className="text-sm text-muted-foreground">Add new task for team</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-3 p-4 h-auto text-left justify-start"
                  >
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Manage Domains</p>
                      <p className="text-sm text-muted-foreground">Create or edit domains</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-3 p-4 h-auto text-left justify-start"
                  >
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">View Reports</p>
                      <p className="text-sm text-muted-foreground">Team performance metrics</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Domain Selection for Team Members */}
          {!isTeamLead && (
            <DomainSelection user={user} domains={domains} />
          )}

          {/* Tasks List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {isTeamLead ? 'All Tasks' : 'My Tasks'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={taskFilter.domain} onValueChange={(value) => setTaskFilter(prev => ({ ...prev, domain: value }))}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      {domains.map((domain: any) => (
                        <SelectItem key={domain.id} value={domain.name}>
                          {domain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={taskFilter.status} onValueChange={(value) => setTaskFilter(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {tasksLoading ? (
                <div className="p-6 text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No tasks found
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredTasks.map((task: Task) => (
                    <TaskCard key={task.id} task={task} user={user} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <CreateTaskModal 
        isOpen={isCreateTaskOpen} 
        onClose={() => setIsCreateTaskOpen(false)}
        domains={domains}
      />
    </div>
  );
}
