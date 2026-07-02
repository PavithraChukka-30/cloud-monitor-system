/**
 * In-memory simulation layer for real-time infrastructure data.
 * Generates realistic, slightly-varied data for nodes, pods, metrics, and logs.
 */

export type NodeStatus = "Ready" | "NotReady" | "Unknown";
export type NodeRole = "master" | "worker";
export type PodStatus = "Running" | "Pending" | "Failed" | "CrashLoopBackOff" | "Terminating" | "Succeeded";

export interface SimNode {
  id: string;
  name: string;
  status: NodeStatus;
  role: NodeRole;
  instanceType: string;
  region: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  podCount: number;
  maxPods: number;
  cpuCores: number;
  memoryGb: number;
  uptime: string;
  kubeletVersion: string;
  createdAt: string;
}

export interface SimPod {
  id: string;
  name: string;
  namespace: string;
  status: PodStatus;
  nodeName: string;
  image: string;
  cpuPercent: number;
  memoryPercent: number;
  restartCount: number;
  readyContainers: number;
  totalContainers: number;
  createdAt: string;
  labels: Record<string, string>;
}

export interface SimMetric {
  timestamp: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  networkInMbps: number;
  networkOutMbps: number;
  requestRate: number;
  responseTimeMs: number;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  metric: string;
}

export interface ActivityEvent {
  id: number;
  type: string;
  message: string;
  severity: string;
  timestamp: string;
  resource: string;
  namespace: string | null;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  pod: string;
  namespace: string;
  container: string;
  traceId: string | null;
}

// Seeded deterministic nodes
const NODES: SimNode[] = [
  {
    id: "node-master-1",
    name: "ip-10-0-1-10.ec2.internal",
    status: "Ready",
    role: "master",
    instanceType: "m5.xlarge",
    region: "us-east-1a",
    cpuPercent: 22,
    memoryPercent: 45,
    diskPercent: 31,
    podCount: 8,
    maxPods: 110,
    cpuCores: 4,
    memoryGb: 16,
    uptime: "42d 7h",
    kubeletVersion: "v1.28.5",
    createdAt: "2025-05-21T08:00:00Z",
  },
  {
    id: "node-worker-1",
    name: "ip-10-0-2-41.ec2.internal",
    status: "Ready",
    role: "worker",
    instanceType: "m5.2xlarge",
    region: "us-east-1b",
    cpuPercent: 68,
    memoryPercent: 72,
    diskPercent: 44,
    podCount: 32,
    maxPods: 110,
    cpuCores: 8,
    memoryGb: 32,
    uptime: "42d 7h",
    kubeletVersion: "v1.28.5",
    createdAt: "2025-05-21T08:05:00Z",
  },
  {
    id: "node-worker-2",
    name: "ip-10-0-3-87.ec2.internal",
    status: "Ready",
    role: "worker",
    instanceType: "m5.2xlarge",
    region: "us-east-1c",
    cpuPercent: 51,
    memoryPercent: 58,
    diskPercent: 38,
    podCount: 28,
    maxPods: 110,
    cpuCores: 8,
    memoryGb: 32,
    uptime: "38d 2h",
    kubeletVersion: "v1.28.5",
    createdAt: "2025-05-25T10:00:00Z",
  },
  {
    id: "node-worker-3",
    name: "ip-10-0-4-22.ec2.internal",
    status: "NotReady",
    role: "worker",
    instanceType: "c5.xlarge",
    region: "us-east-1a",
    cpuPercent: 88,
    memoryPercent: 91,
    diskPercent: 55,
    podCount: 41,
    maxPods: 110,
    cpuCores: 4,
    memoryGb: 8,
    uptime: "12h 34m",
    kubeletVersion: "v1.28.4",
    createdAt: "2025-06-20T06:30:00Z",
  },
  {
    id: "node-worker-4",
    name: "ip-10-0-5-15.ec2.internal",
    status: "Ready",
    role: "worker",
    instanceType: "m5.4xlarge",
    region: "us-east-1b",
    cpuPercent: 38,
    memoryPercent: 43,
    diskPercent: 27,
    podCount: 19,
    maxPods: 110,
    cpuCores: 16,
    memoryGb: 64,
    uptime: "30d 1h",
    kubeletVersion: "v1.28.5",
    createdAt: "2025-06-02T09:00:00Z",
  },
];

const PODS: SimPod[] = [
  // production namespace
  { id: "pod-api-6f4d", name: "api-server-6f4d8b9c4-xk2lp", namespace: "production", status: "Running", nodeName: "ip-10-0-2-41.ec2.internal", image: "myapp/api-server:v2.4.1", cpuPercent: 34, memoryPercent: 42, restartCount: 0, readyContainers: 2, totalContainers: 2, createdAt: "2025-06-28T12:00:00Z", labels: { app: "api-server", env: "production" } },
  { id: "pod-api-8a2c", name: "api-server-6f4d8b9c4-m9vkr", namespace: "production", status: "Running", nodeName: "ip-10-0-3-87.ec2.internal", image: "myapp/api-server:v2.4.1", cpuPercent: 29, memoryPercent: 38, restartCount: 0, readyContainers: 2, totalContainers: 2, createdAt: "2025-06-28T12:00:00Z", labels: { app: "api-server", env: "production" } },
  { id: "pod-api-9b1e", name: "api-server-6f4d8b9c4-pn3qw", namespace: "production", status: "Running", nodeName: "ip-10-0-5-15.ec2.internal", image: "myapp/api-server:v2.4.1", cpuPercent: 41, memoryPercent: 51, restartCount: 1, readyContainers: 2, totalContainers: 2, createdAt: "2025-06-30T08:00:00Z", labels: { app: "api-server", env: "production" } },
  { id: "pod-web-5c2a", name: "web-frontend-5c2a7f1b3-rs7qm", namespace: "production", status: "Running", nodeName: "ip-10-0-2-41.ec2.internal", image: "myapp/web-frontend:v3.1.0", cpuPercent: 12, memoryPercent: 22, restartCount: 0, readyContainers: 1, totalContainers: 1, createdAt: "2025-07-01T10:00:00Z", labels: { app: "web-frontend", env: "production" } },
  { id: "pod-worker-7d3f", name: "bg-worker-7d3f9e2a1-zp5mk", namespace: "production", status: "CrashLoopBackOff", nodeName: "ip-10-0-4-22.ec2.internal", image: "myapp/bg-worker:v1.9.2", cpuPercent: 0, memoryPercent: 5, restartCount: 17, readyContainers: 0, totalContainers: 1, createdAt: "2025-07-01T06:00:00Z", labels: { app: "bg-worker", env: "production" } },
  { id: "pod-db-proxy", name: "db-proxy-4b8c2d1f9-kx9lw", namespace: "production", status: "Running", nodeName: "ip-10-0-2-41.ec2.internal", image: "pgbouncer:1.21", cpuPercent: 8, memoryPercent: 14, restartCount: 0, readyContainers: 1, totalContainers: 1, createdAt: "2025-05-21T08:10:00Z", labels: { app: "db-proxy", env: "production" } },
  { id: "pod-redis-1", name: "redis-cache-9a1e7c3b2-wq8nm", namespace: "production", status: "Running", nodeName: "ip-10-0-3-87.ec2.internal", image: "redis:7.2-alpine", cpuPercent: 5, memoryPercent: 31, restartCount: 0, readyContainers: 1, totalContainers: 1, createdAt: "2025-05-21T08:15:00Z", labels: { app: "redis-cache", env: "production" } },
  // staging namespace
  { id: "pod-api-stg-1", name: "api-server-staging-3e9f2a-vkm8p", namespace: "staging", status: "Running", nodeName: "ip-10-0-5-15.ec2.internal", image: "myapp/api-server:v2.5.0-rc1", cpuPercent: 18, memoryPercent: 26, restartCount: 0, readyContainers: 2, totalContainers: 2, createdAt: "2025-07-01T14:00:00Z", labels: { app: "api-server", env: "staging" } },
  { id: "pod-web-stg-1", name: "web-frontend-staging-1a4c-nj6rp", namespace: "staging", status: "Running", nodeName: "ip-10-0-5-15.ec2.internal", image: "myapp/web-frontend:v3.2.0-beta", cpuPercent: 7, memoryPercent: 15, restartCount: 0, readyContainers: 1, totalContainers: 1, createdAt: "2025-07-01T14:00:00Z", labels: { app: "web-frontend", env: "staging" } },
  { id: "pod-test-1", name: "integration-test-runner-job-7xp2m", namespace: "staging", status: "Succeeded", nodeName: "ip-10-0-5-15.ec2.internal", image: "myapp/test-runner:latest", cpuPercent: 0, memoryPercent: 0, restartCount: 0, readyContainers: 0, totalContainers: 1, createdAt: "2025-07-02T02:00:00Z", labels: { app: "test-runner", env: "staging" } },
  // monitoring namespace
  { id: "pod-prom-1", name: "prometheus-0", namespace: "monitoring", status: "Running", nodeName: "ip-10-0-3-87.ec2.internal", image: "prom/prometheus:v2.50.1", cpuPercent: 22, memoryPercent: 48, restartCount: 0, readyContainers: 1, totalContainers: 1, createdAt: "2025-05-21T08:30:00Z", labels: { app: "prometheus" } },
  { id: "pod-grafana-1", name: "grafana-7c4d9f2b1-qlp5m", namespace: "monitoring", status: "Running", nodeName: "ip-10-0-3-87.ec2.internal", image: "grafana/grafana:10.3.1", cpuPercent: 11, memoryPercent: 29, restartCount: 0, readyContainers: 1, totalContainers: 1, createdAt: "2025-05-21T08:30:00Z", labels: { app: "grafana" } },
  { id: "pod-loki-1", name: "loki-0", namespace: "monitoring", status: "Running", nodeName: "ip-10-0-2-41.ec2.internal", image: "grafana/loki:2.9.4", cpuPercent: 16, memoryPercent: 35, restartCount: 0, readyContainers: 1, totalContainers: 1, createdAt: "2025-05-21T08:35:00Z", labels: { app: "loki" } },
  { id: "pod-alertmgr-1", name: "alertmanager-0", namespace: "monitoring", status: "Running", nodeName: "ip-10-0-5-15.ec2.internal", image: "prom/alertmanager:v0.27.0", cpuPercent: 4, memoryPercent: 12, restartCount: 0, readyContainers: 1, totalContainers: 1, createdAt: "2025-05-21T08:35:00Z", labels: { app: "alertmanager" } },
  // kube-system
  { id: "pod-coredns-1", name: "coredns-5dd5756b68-4r7ws", namespace: "kube-system", status: "Running", nodeName: "ip-10-0-1-10.ec2.internal", image: "registry.k8s.io/coredns/coredns:v1.11.1", cpuPercent: 3, memoryPercent: 8, restartCount: 0, readyContainers: 1, totalContainers: 1, createdAt: "2025-05-21T08:00:00Z", labels: { "k8s-app": "kube-dns" } },
  { id: "pod-coredns-2", name: "coredns-5dd5756b68-9k2xp", namespace: "kube-system", status: "Running", nodeName: "ip-10-0-1-10.ec2.internal", image: "registry.k8s.io/coredns/coredns:v1.11.1", cpuPercent: 2, memoryPercent: 7, restartCount: 0, readyContainers: 1, totalContainers: 1, createdAt: "2025-05-21T08:00:00Z", labels: { "k8s-app": "kube-dns" } },
  { id: "pod-metric-server", name: "metrics-server-7fb9d4876b-jqm8l", namespace: "kube-system", status: "Pending", nodeName: "ip-10-0-4-22.ec2.internal", image: "registry.k8s.io/metrics-server/metrics-server:v0.7.0", cpuPercent: 0, memoryPercent: 0, restartCount: 3, readyContainers: 0, totalContainers: 1, createdAt: "2025-07-02T08:00:00Z", labels: { "k8s-app": "metrics-server" } },
];

const LOG_MESSAGES = [
  { level: "info" as const, messages: ["HTTP GET /api/v1/health 200 12ms", "Cache hit for key user:session:a94f", "Processed 142 queue messages in batch", "Connected to database pool (5/20 connections)", "Serving request from 10.0.0.14", "Config reloaded successfully", "Metrics exported to Prometheus endpoint", "Scheduled job `email-digest` completed in 344ms", "TLS certificate valid for 87 more days", "Health probe passed"] },
  { level: "warn" as const, messages: ["Slow query detected: 423ms on SELECT * FROM events WHERE created_at > ...", "Connection pool at 85% capacity (17/20)", "Rate limit approaching for client 192.168.1.45", "Retry attempt 2/3 for upstream call to payment-service", "Memory usage above 80%, approaching threshold", "Response time degraded: p99=892ms", "Disk usage at 78% on /data volume", "Deprecated API endpoint /v1/users called by client"] },
  { level: "error" as const, messages: ["Failed to connect to Redis: ECONNREFUSED 127.0.0.1:6379", "Unhandled exception in worker thread: TypeError: Cannot read property 'id' of undefined", "HTTP 500 POST /api/v1/checkout - Internal Server Error", "Database query timeout after 30s", "OOMKilled: container exceeded memory limit (512Mi)", "Failed to parse config: unexpected token at line 42", "Circuit breaker OPEN for payment-gateway after 5 consecutive failures"] },
  { level: "debug" as const, messages: ["Entering handler: processWebhook", "Cache miss for key product:catalog:page:3", "Query plan: Seq Scan on orders (cost=0.00..1842.31)", "Token validated, user_id=4892", "Feature flag `dark_mode_v2` evaluated: true", "WebSocket ping sent to client ws-conn-7821"] },
];

function jitter(base: number, range: number): number {
  const t = (Date.now() / 10000) % 1;
  const noise = Math.sin(Date.now() / 7000 + base) * range;
  return Math.max(0, Math.min(100, base + noise * t + noise * 0.5));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function getNodes(): SimNode[] {
  return NODES.map((n) => ({
    ...n,
    cpuPercent: round2(jitter(n.cpuPercent, 8)),
    memoryPercent: round2(jitter(n.memoryPercent, 5)),
    diskPercent: round2(jitter(n.diskPercent, 2)),
  }));
}

export function getNodeById(id: string): SimNode | undefined {
  const node = NODES.find((n) => n.id === id);
  if (!node) return undefined;
  return {
    ...node,
    cpuPercent: round2(jitter(node.cpuPercent, 8)),
    memoryPercent: round2(jitter(node.memoryPercent, 5)),
    diskPercent: round2(jitter(node.diskPercent, 2)),
  };
}

export function getPods(filters?: { namespace?: string; status?: string }): SimPod[] {
  let pods = PODS.map((p) => ({
    ...p,
    cpuPercent: p.status === "Running" ? round2(jitter(p.cpuPercent, 6)) : p.cpuPercent,
    memoryPercent: p.status === "Running" ? round2(jitter(p.memoryPercent, 4)) : p.memoryPercent,
  }));
  if (filters?.namespace) {
    pods = pods.filter((p) => p.namespace === filters.namespace);
  }
  if (filters?.status) {
    pods = pods.filter((p) => p.status === filters.status);
  }
  return pods;
}

export function getPodById(id: string): SimPod | undefined {
  const pod = PODS.find((p) => p.id === id);
  if (!pod) return undefined;
  return {
    ...pod,
    cpuPercent: pod.status === "Running" ? round2(jitter(pod.cpuPercent, 6)) : pod.cpuPercent,
    memoryPercent: pod.status === "Running" ? round2(jitter(pod.memoryPercent, 4)) : pod.memoryPercent,
  };
}

export function getCurrentMetrics(): SimMetric {
  return {
    timestamp: new Date().toISOString(),
    cpuPercent: round2(jitter(57, 12)),
    memoryPercent: round2(jitter(63, 8)),
    diskPercent: round2(jitter(39, 3)),
    networkInMbps: round2(jitter(124, 30)),
    networkOutMbps: round2(jitter(89, 20)),
    requestRate: round2(jitter(1842, 200)),
    responseTimeMs: round2(jitter(48, 15)),
  };
}

const METRIC_KEYS = ["cpu", "memory", "disk", "network_in", "network_out", "request_rate", "response_time"] as const;
type MetricKey = typeof METRIC_KEYS[number];

const METRIC_BASES: Record<MetricKey, { base: number; amplitude: number }> = {
  cpu: { base: 57, amplitude: 20 },
  memory: { base: 63, amplitude: 10 },
  disk: { base: 39, amplitude: 4 },
  network_in: { base: 124, amplitude: 40 },
  network_out: { base: 89, amplitude: 30 },
  request_rate: { base: 1842, amplitude: 400 },
  response_time: { base: 48, amplitude: 20 },
};

export function getMetricsHistory(minutes = 60, metric?: string): MetricDataPoint[] {
  const key = (metric && METRIC_BASES[metric as MetricKey] ? metric : "cpu") as MetricKey;
  const { base, amplitude } = METRIC_BASES[key];
  const now = Date.now();
  const points: MetricDataPoint[] = [];
  // 1 point per minute
  for (let i = minutes; i >= 0; i--) {
    const t = now - i * 60 * 1000;
    const phase = (t / 1000 / 60) * 0.3;
    const value = round2(base + amplitude * 0.5 * Math.sin(phase) + amplitude * 0.3 * Math.sin(phase * 2.7) + (Math.random() - 0.5) * amplitude * 0.2);
    points.push({ timestamp: new Date(t).toISOString(), value: Math.max(0, value), metric: key });
  }
  return points;
}

export function getOverviewSummary() {
  const nodes = getNodes();
  const pods = getPods();
  return {
    totalNodes: nodes.length,
    healthyNodes: nodes.filter((n) => n.status === "Ready").length,
    totalPods: pods.length,
    runningPods: pods.filter((p) => p.status === "Running").length,
    failedPods: pods.filter((p) => ["Failed", "CrashLoopBackOff"].includes(p.status)).length,
    firingAlerts: 0, // filled in route handler from DB
    criticalAlerts: 0,
    avgCpuPercent: round2(nodes.reduce((s, n) => s + n.cpuPercent, 0) / nodes.length),
    avgMemoryPercent: round2(nodes.reduce((s, n) => s + n.memoryPercent, 0) / nodes.length),
    uptime: "42d 7h",
    clusterHealth: nodes.some((n) => n.status === "NotReady") ? "degraded" : "healthy",
  };
}

const ACTIVITY_TEMPLATES: Array<{ type: string; message: string; severity: string; resource: string; namespace: string | null }> = [
  { type: "alert_fired", message: "CPU usage exceeded 80% on node ip-10-0-4-22.ec2.internal", severity: "critical", resource: "node-worker-3", namespace: null },
  { type: "pod_restarted", message: "Pod bg-worker restarted (restartCount: 17) in production", severity: "warning", resource: "pod-worker-7d3f", namespace: "production" },
  { type: "scaling_up", message: "api-server scaled from 2 to 3 replicas (CPU trigger: 78%)", severity: "info", resource: "api-server", namespace: "production" },
  { type: "deployment", message: "web-frontend:v3.1.0 deployed successfully to production", severity: "info", resource: "web-frontend", namespace: "production" },
  { type: "alert_resolved", message: "Memory alert resolved on node ip-10-0-3-87.ec2.internal", severity: "info", resource: "node-worker-2", namespace: null },
  { type: "pod_crashed", message: "Pod bg-worker entered CrashLoopBackOff state", severity: "critical", resource: "pod-worker-7d3f", namespace: "production" },
  { type: "scaling_down", message: "staging api-server scaled from 3 to 1 replicas (low traffic)", severity: "info", resource: "api-server", namespace: "staging" },
  { type: "node_issue", message: "Node ip-10-0-4-22.ec2.internal marked NotReady by kubelet", severity: "critical", resource: "node-worker-3", namespace: null },
  { type: "deployment", message: "api-server:v2.4.1 deployed successfully to production", severity: "info", resource: "api-server", namespace: "production" },
  { type: "alert_fired", message: "Memory usage exceeded 85% on node ip-10-0-4-22.ec2.internal", severity: "warning", resource: "node-worker-3", namespace: null },
];

export function getRecentActivity(): ActivityEvent[] {
  const now = Date.now();
  return ACTIVITY_TEMPLATES.map((t, i) => ({
    id: i + 1,
    ...t,
    timestamp: new Date(now - i * 11 * 60 * 1000 - Math.floor(i * 4.3 * 60 * 1000)).toISOString(),
  }));
}

const LOG_PODS = ["api-server-6f4d8b9c4-xk2lp", "api-server-6f4d8b9c4-m9vkr", "bg-worker-7d3f9e2a1-zp5mk", "web-frontend-5c2a7f1b3-rs7qm", "prometheus-0", "redis-cache-9a1e7c3b2-wq8nm"];
const LOG_NAMESPACES: Record<string, string> = {
  "api-server-6f4d8b9c4-xk2lp": "production",
  "api-server-6f4d8b9c4-m9vkr": "production",
  "bg-worker-7d3f9e2a1-zp5mk": "production",
  "web-frontend-5c2a7f1b3-rs7qm": "production",
  "prometheus-0": "monitoring",
  "redis-cache-9a1e7c3b2-wq8nm": "production",
};
const LOG_CONTAINERS: Record<string, string> = {
  "api-server-6f4d8b9c4-xk2lp": "api-server",
  "api-server-6f4d8b9c4-m9vkr": "api-server",
  "bg-worker-7d3f9e2a1-zp5mk": "bg-worker",
  "web-frontend-5c2a7f1b3-rs7qm": "nginx",
  "prometheus-0": "prometheus",
  "redis-cache-9a1e7c3b2-wq8nm": "redis",
};

export function getLogs(filters?: { namespace?: string; pod?: string; level?: string; limit?: number; search?: string }): LogEntry[] {
  const limit = filters?.limit ?? 100;
  const allLogs: LogEntry[] = [];
  const now = Date.now();

  // Generate synthetic log entries
  for (let i = 0; i < 200; i++) {
    const levelGroup = LOG_MESSAGES[i % LOG_MESSAGES.length];
    const pod = LOG_PODS[i % LOG_PODS.length];
    const message = levelGroup.messages[Math.floor(i / LOG_MESSAGES.length) % levelGroup.messages.length];
    allLogs.push({
      id: i + 1,
      timestamp: new Date(now - i * 3500 - Math.floor(i * 1200)).toISOString(),
      level: levelGroup.level,
      message,
      pod,
      namespace: LOG_NAMESPACES[pod] ?? "production",
      container: LOG_CONTAINERS[pod] ?? "app",
      traceId: levelGroup.level !== "debug" ? `trace-${(i * 7919 + 31337).toString(16).slice(0, 8)}` : null,
    });
  }

  let filtered = allLogs;
  if (filters?.namespace) filtered = filtered.filter((l) => l.namespace === filters.namespace);
  if (filters?.pod) filtered = filtered.filter((l) => l.pod.includes(filters.pod!));
  if (filters?.level) filtered = filtered.filter((l) => l.level === filters.level);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter((l) => l.message.toLowerCase().includes(q) || l.pod.toLowerCase().includes(q));
  }

  return filtered.slice(0, limit);
}
