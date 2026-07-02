import React, { useState } from 'react';
import { useListPods } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Box, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Pods() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: pods, isLoading } = useListPods({ 
    status: statusFilter !== 'all' ? statusFilter as any : undefined 
  });

  const filteredPods = pods?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.namespace.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'Running': return 'success';
      case 'Pending': return 'warning';
      case 'Failed':
      case 'CrashLoopBackOff': return 'destructive';
      case 'Succeeded': return 'info';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase">Pods Explorer</h1>
          <p className="text-muted-foreground font-mono text-sm">Workload containers</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] font-mono">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Running">Running</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="CrashLoopBackOff">CrashLoopBackOff</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search pods..." 
              className="pl-8 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pod Name</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ready</TableHead>
                <TableHead>Restarts</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Node</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : filteredPods?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No pods found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPods?.map((pod) => (
                  <TableRow key={pod.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate max-w-[200px]" title={pod.name}>{pod.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{pod.namespace}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(pod.status)}>
                        {pod.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={pod.readyContainers < pod.totalContainers ? 'text-destructive font-bold' : ''}>
                        {pod.readyContainers}/{pod.totalContainers}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={pod.restartCount > 0 ? 'text-warning font-bold' : 'text-muted-foreground'}>
                        {pod.restartCount}
                      </span>
                    </TableCell>
                    <TableCell>{pod.cpuPercent.toFixed(1)}%</TableCell>
                    <TableCell>{pod.memoryPercent.toFixed(1)}%</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[150px]" title={pod.nodeName}>
                      {pod.nodeName}
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
