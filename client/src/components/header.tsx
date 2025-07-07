import { Button } from '@/components/ui/button';
import { Bell, Plus } from 'lucide-react';
import type { User } from '@shared/schema';

interface HeaderProps {
  user: User;
  onCreateTask: () => void;
}

export default function Header({ user, onCreateTask }: HeaderProps) {
  const isTeamLead = user.role === 'lead';

  return (
    <header className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            {isTeamLead 
              ? "Manage your team's tasks and track progress" 
              : "View your assigned tasks and domain preferences"
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              3
            </span>
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
