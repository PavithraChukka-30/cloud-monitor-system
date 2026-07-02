import React, { useState, useEffect, useRef } from 'react';
import { useGetLogs, getGetLogsQueryKey } from '@workspace/api-client-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal, Search, Filter, Play, Square, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Logs() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [isFollowing, setIsFollowing] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: logs, isLoading, refetch } = useGetLogs({
    search: debouncedSearch || undefined,
    level: levelFilter !== 'all' ? levelFilter as any : undefined,
    limit: 200
  }, { 
    query: { 
      refetchInterval: isFollowing ? 2000 : false,
      queryKey: getGetLogsQueryKey()
    } 
  });

  // Auto-scroll to bottom when following
  useEffect(() => {
    if (isFollowing && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isFollowing]);

  // Disable following if user scrolls up manually
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    if (!isAtBottom && isFollowing) {
      setIsFollowing(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'error': return 'text-destructive';
      case 'warn': return 'text-warning';
      case 'info': return 'text-primary';
      case 'debug': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono uppercase">Log Stream</h1>
          <p className="text-muted-foreground font-mono text-sm">Aggregated container logs</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={isFollowing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsFollowing(!isFollowing)}
            className="w-32"
          >
            {isFollowing ? (
              <><Square className="w-4 h-4 mr-2" /> Stop Tail</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Follow</>
            )}
          </Button>
          <Button variant="outline" size="icon" title="Export logs">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-2 rounded-sm border flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Grep logs (regex supported)..." 
            className="pl-8 border-none shadow-none focus-visible:ring-0 bg-transparent font-mono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-px h-6 bg-border mx-2" />
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 bg-transparent font-mono">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 bg-[#0d0d12] border rounded-sm overflow-hidden flex flex-col relative font-mono text-sm shadow-inner">
        {/* Terminal Header */}
        <div className="h-8 bg-[#1a1a24] border-b border-border/40 flex items-center px-4 gap-2 flex-shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-success/80" />
          </div>
          <div className="mx-auto text-xs text-muted-foreground flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            stdout / stderr
          </div>
        </div>

        {/* Log Area */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-1.5"
        >
          {isLoading && !logs ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 bg-muted/20" />
              <Skeleton className="h-4 w-1/2 bg-muted/20" />
              <Skeleton className="h-4 w-5/6 bg-muted/20" />
            </div>
          ) : logs?.length === 0 ? (
            <div className="text-muted-foreground italic h-full flex items-center justify-center">
              No logs matched your criteria.
            </div>
          ) : (
            logs?.map((log) => (
              <div key={log.id} className="flex hover:bg-white/5 px-2 -mx-2 rounded py-0.5 group">
                <div className="w-[180px] flex-shrink-0 text-muted-foreground/60 select-none">
                  {new Date(log.timestamp).toISOString().replace('T', ' ').replace('Z', '')}
                </div>
                <div className={`w-14 flex-shrink-0 font-bold ${getLevelColor(log.level)} uppercase text-xs mt-0.5 select-none`}>
                  {log.level}
                </div>
                <div className="w-[200px] flex-shrink-0 text-muted-foreground truncate mr-4 select-none" title={`${log.pod} / ${log.container}`}>
                  [{log.pod}]
                </div>
                <div className="flex-1 text-[#e2e2e8] whitespace-pre-wrap break-all">
                  {log.message}
                  {log.traceId && (
                    <span className="ml-2 text-muted-foreground/50 text-xs">
                      trace={log.traceId}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
        
        {/* Scroll hint when paused */}
        {!isFollowing && logs && logs.length > 0 && (
          <div className="absolute bottom-4 right-6">
            <Button 
              size="sm" 
              className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 shadow-lg backdrop-blur-sm"
              onClick={() => setIsFollowing(true)}
            >
              <ArrowDownIcon /> Resume Auto-Scroll
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
  );
}
