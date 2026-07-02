import React, { useState } from 'react';
import { 
  useListAlerts, 
  useAcknowledgeAlert, 
  useResolveAlert,
  getListAlertsQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Bell, Check, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Alerts() {
  const [statusFilter, setStatusFilter] = useState<string>('firing');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: alerts, isLoading } = useListAlerts({ 
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    severity: severityFilter !== 'all' ? severityFilter as any : undefined
  });

  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();

  const handleAcknowledge = (id: number) => {
    acknowledgeAlert.mutate({ alertId: id }, {
      onSuccess: () => {
        toast({
          title: "Alert Acknowledged",
          description: "The alert has been marked as acknowledged.",
        });
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to acknowledge alert.",
          variant: "destructive",
        });
      }
    });
  };

  const handleResolve = (id: number) => {
    resolveAlert.mutate({ alertId: id }, {
      onSuccess: () => {
        toast({
          title: "Alert Resolved",
          description: "The alert has been marked as resolved.",
        });
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to resolve alert.",
          variant: "destructive",
        });
      }
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <ShieldAlert className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'info': return <Bell className="w-4 h-4 text-info" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase">Alert Center</h1>
          <p className="text-muted-foreground font-mono text-sm">System and application alerts</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[150px] font-mono">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] font-mono">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="firing">Firing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Value / Threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-40 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : alerts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground font-mono">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Check className="w-8 h-8 text-success mb-2" />
                      <p>No alerts matching criteria.</p>
                      <p className="text-xs">Systems are operating normally.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                alerts?.map((alert) => (
                  <TableRow 
                    key={alert.id} 
                    className={`hover:bg-muted/50 ${alert.status === 'firing' && !alert.acknowledged ? 'bg-destructive/5' : ''}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        <Badge variant={alert.severity as any} className="uppercase">
                          {alert.severity}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-md">
                      {alert.message}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{alert.resource}</span>
                        {alert.namespace && <span className="text-xs text-muted-foreground">{alert.namespace}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {alert.value !== null && alert.threshold !== null ? (
                        <div className="flex items-center gap-2">
                          <span className={alert.severity === 'critical' ? 'text-destructive font-bold' : 'text-warning font-bold'}>
                            {alert.value?.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">/ {alert.threshold}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={alert.status === 'resolved' ? 'success' : alert.status === 'firing' ? 'destructive' : 'warning'}>
                        {alert.status}
                      </Badge>
                      {alert.acknowledged && alert.status === 'firing' && (
                        <Badge variant="outline" className="ml-2 text-[10px]">ACK</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <AlertTriangle className="w-3 h-3" /> 
                          {new Date(alert.firedAt).toLocaleString()}
                        </span>
                        {alert.resolvedAt && (
                          <span className="flex items-center gap-1 text-success mt-1">
                            <Check className="w-3 h-3" />
                            {new Date(alert.resolvedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {alert.status === 'firing' && !alert.acknowledged && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAcknowledge(alert.id)}
                            disabled={acknowledgeAlert.isPending}
                          >
                            <Clock className="w-3 h-3 mr-1" /> Ack
                          </Button>
                        )}
                        {alert.status === 'firing' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-success text-success-foreground hover:bg-success/90"
                            onClick={() => handleResolve(alert.id)}
                            disabled={resolveAlert.isPending}
                          >
                            <Check className="w-3 h-3 mr-1" /> Resolve
                          </Button>
                        )}
                      </div>
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
