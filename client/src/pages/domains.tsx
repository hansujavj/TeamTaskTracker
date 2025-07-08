import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Layers, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Domain } from '@shared/schema';

export default function Domains() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDomain, setNewDomain] = useState({ name: '', description: '' });

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['/api/domains'],
    enabled: !!user,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    enabled: !!user,
  });

  const createDomainMutation = useMutation({
    mutationFn: async (domainData: { name: string; description: string }) => {
      const response = await apiRequest('POST', '/api/domains', domainData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      toast({
        title: 'Domain created',
        description: 'New domain has been created successfully.',
      });
      setIsCreateOpen(false);
      setNewDomain({ name: '', description: '' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create domain',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Domain name is required.',
        variant: 'destructive',
      });
      return;
    }
    createDomainMutation.mutate(newDomain);
  };

  if (!user) return null;

  const isTeamLead = user.role === 'lead';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Domains</h1>
            <p className="text-muted-foreground mt-2">
              Manage project domains and team assignments
            </p>
          </div>
          {isTeamLead && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Domain
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Domain</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Domain Name</Label>
                    <Input
                      id="name"
                      value={newDomain.name}
                      onChange={(e) => setNewDomain(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Frontend Development"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newDomain.description}
                      onChange={(e) => setNewDomain(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this domain"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createDomainMutation.isPending}>
                      {createDomainMutation.isPending ? 'Creating...' : 'Create Domain'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading domains...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain: Domain) => {
              const domainUsers = users.filter((u: any) => u.preferredDomain === domain.name);
              
              return (
                <Card key={domain.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{domain.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {domainUsers.length} member{domainUsers.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {domain.description || 'No description provided'}
                    </p>
                    
                    {domainUsers.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Team Members</span>
                        </div>
                        <div className="space-y-2">
                          {domainUsers.map((member: any) => (
                            <div key={member.id} className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm">{member.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}