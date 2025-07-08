import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Home, ListTodo, Users, LogOut, Layers, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import type { User } from '@shared/schema';

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const { logout } = useAuth();
  const [location] = useLocation();
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

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
          <Link href="/">
            <Button variant="ghost" className={`w-full justify-start ${location === '/' ? 'bg-accent text-accent-foreground' : ''}`}>
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </Button>
          </Link>
          <Link href="/domains">
            <Button variant="ghost" className={`w-full justify-start ${location === '/domains' ? 'bg-accent text-accent-foreground' : ''}`}>
              <Layers className="w-5 h-5 mr-3" />
              Domains
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="ghost" className={`w-full justify-start ${location === '/reports' ? 'bg-accent text-accent-foreground' : ''}`}>
              <BarChart3 className="w-5 h-5 mr-3" />
              Reports
            </Button>
          </Link>
        </nav>

        {/* Team Members Section */}
        {user.role === 'lead' && users.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Team Members</h3>
            <div className="space-y-2">
              {users.filter((u: User) => u.role === 'member').map((member: User) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.preferredDomain || 'No domain'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
