import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp } from 'lucide-react';

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: ListTodo,
      bgColor: 'bg-blue-100',
      iconColor: 'text-primary',
      trend: '+12%',
      trendText: 'from last week'
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      icon: CheckCircle2,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: '+8%',
      trendText: 'completion rate'
    },
    {
      title: 'In Progress',
      value: stats?.inProgress || 0,
      icon: Clock,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      trend: null,
      trendText: 'Active assignments'
    },
    {
      title: 'Overdue',
      value: stats?.overdue || 0,
      icon: AlertTriangle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      trend: null,
      trendText: 'Needs attention'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {stat.trend && (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.trend}
                </span>
              )}
              <span className={`text-muted-foreground ${stat.trend ? 'ml-2' : ''}`}>
                {stat.trendText}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
