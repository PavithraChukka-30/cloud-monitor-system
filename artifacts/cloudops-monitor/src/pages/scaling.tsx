import React from 'react';
import { useListScalingEvents, useListScalingPolicies } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpCircle, ArrowDownCircle, Network, Power } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function AutoScaling() {
  const { data: events, isLoading: loadingEvents } = useListScalingEvents({ limit: 50 });
  const { data: policies, isLoading: loadingPolicies } = useListScalingPolicies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase">Auto-Scaling</h1>
        <p className="text-muted-foreground font-mono text-sm">HPA policies and scaling history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Active Scaling Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Name</TableHead>
                <TableHead>Target Deployment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Replicas (Min/Cur/Max)</TableHead>
                <TableHead>CPU Target</TableHead>
                <TableHead>Memory Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingPolicies ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : policies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No scaling policies configured.
                  </TableCell>
                </TableRow>
              ) : (
                policies?.map((policy) => (
                  <TableRow key={policy.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {policy.name}
                      <div className="text-xs text-muted-foreground">{policy.namespace}</div>
                    </TableCell>
                    <TableCell>{policy.deployment}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${policy.enabled ? 'bg-success' : 'bg-muted-foreground'}`} />
                        {policy.enabled ? 'Active' : 'Disabled'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-48">
                        <span className="text-xs text-muted-foreground w-4">{policy.minReplicas}</span>
                        <div className="flex-1">
                          <Progress 
                            value={(policy.currentReplicas / policy.maxReplicas) * 100} 
                            className="h-2"
                            indicatorColor="bg-primary"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-4">{policy.maxReplicas}</span>
                        <Badge variant="outline" className="ml-2 font-bold">{policy.currentReplicas}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{policy.targetCpuPercent}%</Badge>
                    </TableCell>
                    <TableCell>
                      {policy.targetMemoryPercent ? (
                        <Badge variant="secondary">{policy.targetMemoryPercent}%</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="w-4 h-4" />
            Recent Scaling Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Deployment</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingEvents ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  </TableRow>
                ))
              ) : events?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No recent scaling events.
                  </TableCell>
                </TableRow>
              ) : (
                events?.map((event) => (
                  <TableRow key={event.id} className="hover:bg-muted/50">
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={event.direction === 'up' ? 'warning' : 'success'} 
                        className="flex w-16 justify-center"
                      >
                        {event.direction === 'up' ? <ArrowUpCircle className="w-3 h-3 mr-1" /> : <ArrowDownCircle className="w-3 h-3 mr-1" />}
                        {event.direction.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {event.deployment}
                      <span className="text-xs text-muted-foreground ml-2">({event.namespace})</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-muted-foreground">{event.previousReplicas}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className={event.direction === 'up' ? 'text-warning font-bold' : 'text-success font-bold'}>
                          {event.newReplicas}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.cpuTrigger ? (
                        <span className="text-xs font-mono">{event.cpuTrigger}% CPU</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-md truncate" title={event.reason}>
                      {event.reason}
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
