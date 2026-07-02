import React from 'react';
import { useListDeployments } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Rocket, GitCommit, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function Deployments() {
  const { data: deployments, isLoading } = useListDeployments();

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'rolling': return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'success': return 'success';
      case 'failed': return 'destructive';
      case 'rolling': return 'info';
      case 'pending': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase">Deployments</h1>
        <p className="text-muted-foreground font-mono text-sm">Release history and rollout status</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deployment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Replicas</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Deployed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : deployments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground font-mono">
                    <Rocket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No deployments found.
                  </TableCell>
                </TableRow>
              ) : (
                deployments?.map((dep) => (
                  <TableRow key={dep.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{dep.name}</span>
                        <span className="text-xs text-muted-foreground">{dep.namespace}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(dep.status)}
                        <Badge variant={getStatusVariant(dep.status)}>
                          {dep.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{dep.version}</span>
                        {dep.previousVersion && (
                          <span className="text-xs text-muted-foreground line-through">
                            {dep.previousVersion}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground" title={dep.image}>
                      {dep.image}
                    </TableCell>
                    <TableCell>
                      <span className={dep.readyReplicas < dep.replicas ? 'text-warning font-bold' : ''}>
                        {dep.readyReplicas}/{dep.replicas}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">{dep.triggeredBy}</span>
                        {dep.commitSha && (
                          <Badge variant="outline" className="w-fit text-[10px] font-mono py-0">
                            <GitCommit className="w-3 h-3 mr-1" />
                            {dep.commitSha.substring(0, 7)}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {dep.duration ? `${dep.duration}s` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(dep.deployedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
