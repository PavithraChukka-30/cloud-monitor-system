import React, { useMemo } from 'react';
import { 
  useGetOverviewSummary, 
  useGetRecentActivity, 
  useGetCurrentMetrics,
  useGetMetricsHistory,
  useListAlerts,
  getGetOverviewSummaryQueryKey,
  getGetCurrentMetricsQueryKey,
  getGetRecentActivityQueryKey
} from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, CheckCircle, Clock, Cpu, HardDrive, MemoryStick, Server, ShieldAlert, XCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { formatBytes } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetOverviewSummary({ query: { refetchInterval: 15000, queryKey: getGetOverviewSummaryQueryKey() } });
  const { data: currentMetrics, isLoading: loadingMetrics } = useGetCurrentMetrics({ query: { refetchInterval: 15000, queryKey: getGetCurrentMetricsQueryKey() } });
  const { data: recentActivity } = useGetRecentActivity({ query: { refetchInterval: 15000, queryKey: getGetRecentActivityQueryKey() } });
  const { data: alerts } = useListAlerts({ status: 'firing' });
  
  const { data: cpuHistory } = useGetMetricsHistory({ metric: 'cpu', minutes: 30 });
  const { data: memHistory } = useGetMetricsHistory({ metric: 'memory', minutes: 30 });

  const healthColor = summary?.clusterHealth === 'healthy' ? 'text-success' : summary?.clusterHealth === 'degraded' ? 'text-warning' : 'text-destructive';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase">Cluster Overview</h1>
          <p className="text-muted-foreground font-mono text-sm">Real-time metrics and status</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="font-mono bg-background">
            <Clock className="w-3 h-3 mr-2 text-muted-foreground" />
            Uptime: {summary?.uptime || '--'}
          </Badge>
          <Badge variant="outline" className={`font-mono bg-background border-current ${healthColor}`}>
            <Activity className="w-3 h-3 mr-2" />
            {summary?.clusterHealth || 'Unknown'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Nodes" 
          value={`${summary?.healthyNodes || 0}/${summary?.totalNodes || 0}`}
          icon={<Server className="w-4 h-4" />}
          loading={loadingSummary}
          subtitle="Ready / Total"
          status={summary?.healthyNodes === summary?.totalNodes ? 'success' : 'warning'}
        />
        <StatCard 
          title="Pods" 
          value={`${summary?.runningPods || 0}/${summary?.totalPods || 0}`}
          icon={<BoxIcon />}
          loading={loadingSummary}
          subtitle={`${summary?.failedPods || 0} failed`}
          status={summary?.failedPods ? 'destructive' : 'success'}
        />
        <StatCard 
          title="Alerts" 
          value={summary?.firingAlerts?.toString() || '0'}
          icon={<AlertTriangle className="w-4 h-4" />}
          loading={loadingSummary}
          subtitle={`${summary?.criticalAlerts || 0} critical`}
          status={(summary?.firingAlerts || 0) > 0 ? ((summary?.criticalAlerts || 0) > 0 ? 'destructive' : 'warning') : 'success'}
        />
        <StatCard 
          title="Avg CPU" 
          value={`${summary?.avgCpuPercent?.toFixed(1) || 0}%`}
          icon={<Cpu className="w-4 h-4" />}
          loading={loadingSummary}
          subtitle="Cluster wide"
          status={(summary?.avgCpuPercent || 0) > 80 ? 'destructive' : 'success'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ResourceMeter 
                  title="CPU Usage" 
                  percent={currentMetrics?.cpuPercent || 0} 
                  icon={<Cpu className="w-4 h-4 text-muted-foreground" />}
                />
                <ResourceMeter 
                  title="Memory Usage" 
                  percent={currentMetrics?.memoryPercent || 0} 
                  icon={<MemoryStick className="w-4 h-4 text-muted-foreground" />}
                />
                <ResourceMeter 
                  title="Disk I/O" 
                  percent={currentMetrics?.diskPercent || 0} 
                  icon={<HardDrive className="w-4 h-4 text-muted-foreground" />}
                />
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricChart title="CPU Trend (30m)" data={cpuHistory || []} color="hsl(var(--chart-1))" />
                <MetricChart title="Memory Trend (30m)" data={memHistory || []} color="hsl(var(--chart-2))" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity?.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 text-sm font-mono border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="mt-0.5">
                      {activity.severity === 'critical' ? (
                        <XCircle className="w-4 h-4 text-destructive" />
                      ) : activity.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{activity.type}</span>
                        <span className="text-muted-foreground text-xs">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-muted-foreground">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{activity.resource}</Badge>
                        {activity.namespace && <Badge variant="outline" className="text-[10px]">{activity.namespace}</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Currently firing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!alerts?.length ? (
                  <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                    No active alerts.
                  </div>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="p-3 bg-muted/50 rounded-sm border border-border/50 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'warning'}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">{new Date(alert.firedAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm font-mono">{alert.message}</p>
                      <div className="text-xs text-muted-foreground font-mono">
                        {alert.resource} {alert.namespace && `(${alert.namespace})`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Network Traffic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 font-mono">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Inbound</span>
                    <span className="font-semibold text-primary">{currentMetrics?.networkInMbps.toFixed(2)} Mbps</span>
                  </div>
                  <Progress value={Math.min(100, (currentMetrics?.networkInMbps || 0) / 10)} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Outbound</span>
                    <span className="font-semibold text-chart-4">{currentMetrics?.networkOutMbps.toFixed(2)} Mbps</span>
                  </div>
                  <Progress value={Math.min(100, (currentMetrics?.networkOutMbps || 0) / 10)} className="h-1" indicatorColor="bg-chart-4" />
                </div>
                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Req Rate</span>
                    <span>{currentMetrics?.requestRate.toFixed(0)} req/s</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Latency</span>
                    <span>{currentMetrics?.responseTimeMs.toFixed(1)} ms</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, loading, status }: any) {
  const statusColor = status === 'success' ? 'text-success' : status === 'warning' ? 'text-warning' : status === 'destructive' ? 'text-destructive' : 'text-primary';
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">{icon}</div>
          <div className={`text-xs font-mono font-bold uppercase tracking-wider ${statusColor}`}>{title}</div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <span className="text-3xl font-bold font-mono tracking-tighter">{value}</span>
          )}
        </div>
        <div className="mt-1 text-xs text-muted-foreground font-mono">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function ResourceMeter({ title, percent, icon }: any) {
  const colorClass = percent > 90 ? 'bg-destructive' : percent > 75 ? 'bg-warning' : 'bg-success';
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-mono font-semibold">{title}</span>
        </div>
        <span className="text-sm font-mono">{percent.toFixed(1)}%</span>
      </div>
      <Progress value={percent} className="h-2" indicatorColor={colorClass} />
    </div>
  );
}

function MetricChart({ title, data, color }: any) {
  return (
    <div className="h-32">
      <div className="text-xs font-mono text-muted-foreground mb-2">{title}</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '2px', fontFamily: 'monospace', fontSize: '12px' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            labelFormatter={(label) => new Date(label).toLocaleTimeString()}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function BoxIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  );
}
