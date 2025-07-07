import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, Check, Edit, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, parseISO } from 'date-fns';
import type { Task, User as UserType } from '@shared/schema';

interface TaskCardProps {
  task: Task;
  user: UserType;
}

export default function TaskCard({ task, user }: TaskCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateTaskMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest('PUT', `/api/tasks/${task.id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: 'Task updated',
        description: 'Task status has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update task',
        variant: 'destructive',
      });
    },
  });

  const deadline = parseISO(task.deadline.toString());
  const isOverdue = task.status === 'pending' && isAfter(new Date(), deadline);
  const isCompleted = task.status === 'completed';
  
  const canEdit = user.role === 'lead' || task.assignedTo === user.id;

  const handleMarkComplete = () => {
    updateTaskMutation.mutate('completed');
  };

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      'Design': 'bg-blue-100 text-blue-800',
      'Development': 'bg-green-100 text-green-800',
      'Research': 'bg-purple-100 text-purple-800',
    };
    return colors[domain] || 'bg-slate-100 text-slate-800';
  };

  const getStatusColor = (status: string) => {
    if (isOverdue) return 'bg-red-100 text-red-800';
    if (isCompleted) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = () => {
    if (isOverdue) return 'Overdue';
    if (isCompleted) return 'Completed';
    return 'Pending';
  };

  return (
    <div className={`p-6 hover:bg-slate-50 transition-colors ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-medium">{task.title}</h4>
            <Badge className={getDomainColor(task.domain)}>{task.domain}</Badge>
            <Badge className={getStatusColor(task.status)}>{getStatusText()}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mb-3">{task.description}</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Assigned to User {task.assignedTo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Due {format(deadline, 'MMM d, yyyy')}</span>
            </div>
            {isOverdue && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Overdue</span>
              </div>
            )}
            {isCompleted && task.completedAt && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>Completed {format(parseISO(task.completedAt.toString()), 'MMM d')}</span>
              </div>
            )}
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            {!isCompleted && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkComplete}
                disabled={updateTaskMutation.isPending}
                className="text-green-600 hover:text-green-700"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
