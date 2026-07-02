import React, { useState } from 'react';
import { useListNodes } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Server, Search } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

export default function Nodes() {
  const { data: nodes, isLoading } = useListNodes();
  const [search, setSearch] = useState('');

  const filteredNodes = nodes?.filter(n => 
    n.name.toLowerCase().includes(search.toLowerCase()) || 
    n.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase">Node Inventory</h1>
          <p className="text-muted-foreground font-mono text-sm">Cluster compute resources</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search nodes..." 
            className="pl-8 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Node Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Type & Region</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Pods</TableHead>
                <TableHead className="text-right">Uptime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-2 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-2 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredNodes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No nodes found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredNodes?.map((node) => (
                  <TableRow key={node.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-muted-foreground" />
                        {node.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={node.status === 'Ready' ? 'success' : node.status === 'NotReady' ? 'destructive' : 'outline'}>
                        {node.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{node.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{node.instanceType}</span>
                        <span className="text-xs text-muted-foreground">{node.region}</span>
                      </div>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>{node.cpuPercent.toFixed(0)}%</span>
                        <span className="text-muted-foreground">{node.cpuCores}c</span>
                      </div>
                      <Progress 
                        value={node.cpuPercent} 
                        indicatorColor={node.cpuPercent > 85 ? 'bg-destructive' : node.cpuPercent > 70 ? 'bg-warning' : 'bg-success'} 
                      />
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>{node.memoryPercent.toFixed(0)}%</span>
                        <span className="text-muted-foreground">{node.memoryGb}GB</span>
                      </div>
                      <Progress 
                        value={node.memoryPercent} 
                        indicatorColor={node.memoryPercent > 85 ? 'bg-destructive' : node.memoryPercent > 70 ? 'bg-warning' : 'bg-success'} 
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={node.podCount >= node.maxPods * 0.9 ? 'text-warning' : ''}>
                          {node.podCount}
                        </span>
                        <span className="text-muted-foreground text-xs">/ {node.maxPods}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {node.uptime}
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
