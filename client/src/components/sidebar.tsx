import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Home, ListTodo, Users, LogOut, Layers } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@shared/schema';

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const { logout } = useAuth();

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <aside className="w-64 bg-white border-r border-border shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">TaskFlow</h1>
            <p className="text-sm text-muted-foreground">Team Manager</p>
          </div>
        </div>

        <nav className="space-y-2 mb-8">
          <Button variant="ghost" className="w-full justify-start bg-accent text-accent-foreground">
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <ListTodo className="w-5 h-5 mr-3" />
            {user.role === 'lead' ? 'All Tasks' : 'My Tasks'}
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Layers className="w-5 h-5 mr-3" />
            Domains
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Users className="w-5 h-5 mr-3" />
            Team
          </Button>
        </nav>

        <Card className="p-3 absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </aside>
  );
}
