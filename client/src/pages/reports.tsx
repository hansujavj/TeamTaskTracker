import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Clock, CheckCircle, Users, AlertTriangle } from 'lucide-react';
import type { Task, User } from '@shared/schema';

export default function Reports() {
  const { user } = useAuth();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: !!user,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    enabled: !!user,
  });

  const { data: domains = [], isLoading: domainsLoading } = useQuery({
    queryKey: ['/api/domains'],
    enabled: !!user,
  });

  if (!user) return null;

  const isLoading = tasksLoading || usersLoading || domainsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task: Task) => task.status === 'completed').length;
  const pendingTasks = tasks.filter((task: Task) => task.status === 'pending').length;
  const overdueTasks = tasks.filter((task: Task) => {
    return task.status === 'pending' && new Date(task.deadline) < new Date();
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Domain statistics
  const domainStats = domains.map((domain: any) => {
    const domainTasks = tasks.filter((task: Task) => task.domain === domain.name);
    const domainUsers = users.filter((u: User) => u.preferredDomain === domain.name);
    const completedDomainTasks = domainTasks.filter((task: Task) => task.status === 'completed').length;
    const domainCompletionRate = domainTasks.length > 0 ? Math.round((completedDomainTasks / domainTasks.length) * 100) : 0;

    return {
      ...domain,
      taskCount: domainTasks.length,
      userCount: domainUsers.length,
      completionRate: domainCompletionRate,
      completedTasks: completedDomainTasks,
    };
  });

  // User performance (for team leads)
  const userStats = users.filter((u: User) => u.role === 'member').map((member: User) => {
    const memberTasks = tasks.filter((task: Task) => task.assignedTo === member.id);
    const memberCompleted = memberTasks.filter((task: Task) => task.status === 'completed').length;
    const memberCompletionRate = memberTasks.length > 0 ? Math.round((memberCompleted / memberTasks.length) * 100) : 0;

    return {
      ...member,
      taskCount: memberTasks.length,
      completedTasks: memberCompleted,
      completionRate: memberCompletionRate,
    };
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track team performance and project insights
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{pendingTasks}</div>
              <p className="text-xs text-muted-foreground">Active tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Domain Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Domain Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {domainStats.map((domain: any) => (
                <div key={domain.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{domain.name}</div>
                      <Badge variant="secondary">{domain.userCount} members</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {domain.completedTasks}/{domain.taskCount} tasks ({domain.completionRate}%)
                    </div>
                  </div>
                  <Progress value={domain.completionRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Member Performance (Team Lead only) */}
        {user.role === 'lead' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Member Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userStats.map((member: any) => (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.preferredDomain || 'No domain'}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.completedTasks}/{member.taskCount} tasks ({member.completionRate}%)
                      </div>
                    </div>
                    <Progress value={member.completionRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}