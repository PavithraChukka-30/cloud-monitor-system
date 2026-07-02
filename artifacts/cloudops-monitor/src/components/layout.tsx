import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Activity, 
  Server, 
  Box, 
  Bell, 
  Rocket, 
  Terminal, 
  Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHealthCheck, getHealthCheckQueryKey } from '@workspace/api-client-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Activity },
  { path: '/nodes', label: 'Nodes', icon: Server },
  { path: '/pods', label: 'Pods', icon: Box },
  { path: '/deployments', label: 'Deployments', icon: Rocket },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/scaling', label: 'Auto-Scaling', icon: Network },
  { path: '/logs', label: 'Logs', icon: Terminal },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck({ query: { refetchInterval: 30000, queryKey: getHealthCheckQueryKey() } });

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      <aside className="w-56 flex-shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col h-full z-10 relative">
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2">
          <div className="w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center font-bold font-mono text-sm leading-none">
            C
          </div>
          <span className="font-semibold text-sidebar-foreground tracking-tight text-sm uppercase">CloudOps Monitor</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors duration-150 relative group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
                  isActive 
                    ? "text-sidebar-accent-foreground bg-sidebar-accent" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border text-xs font-mono">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              health?.status === 'ok' ? "bg-success" : "bg-destructive"
            )} />
            <span className="text-muted-foreground">API Status</span>
          </div>
          <div className="text-muted-foreground/60">
            v0.1.0-alpha • {health?.status === 'ok' ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Subtle top gradient line for depth */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent z-10 pointer-events-none" />
        
        <div className="flex-1 overflow-auto bg-background p-6">
          <div className="mx-auto max-w-7xl h-full flex flex-col">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
