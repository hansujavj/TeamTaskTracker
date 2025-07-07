import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { User, Domain } from '@shared/schema';

interface DomainSelectionProps {
  user: User;
  domains: Domain[];
}

export default function DomainSelection({ user, domains }: DomainSelectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      const response = await apiRequest('PUT', '/api/users/domain', { domain });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Domain updated',
        description: 'Your domain preference has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update domain',
        variant: 'destructive',
      });
    },
  });

  const handleDomainSelect = (domainName: string) => {
    if (domainName !== user.preferredDomain) {
      updateDomainMutation.mutate(domainName);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">My Domain Preferences</CardTitle>
          <Button variant="outline" size="sm">
            Edit Preferences
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {domains.map((domain) => {
            const isSelected = domain.name === user.preferredDomain;
            return (
              <Card
                key={domain.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleDomainSelect(domain.name)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{domain.name}</h4>
                    {isSelected && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {domain.description}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Active domain</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
