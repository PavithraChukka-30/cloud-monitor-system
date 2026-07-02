import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { Layout } from '@/components/layout';
import Dashboard from '@/pages/dashboard';
import Nodes from '@/pages/nodes';
import Pods from '@/pages/pods';
import Alerts from '@/pages/alerts';
import Scaling from '@/pages/scaling';
import Deployments from '@/pages/deployments';
import Logs from '@/pages/logs';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/nodes" component={Nodes} />
        <Route path="/pods" component={Pods} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/scaling" component={Scaling} />
        <Route path="/deployments" component={Deployments} />
        <Route path="/logs" component={Logs} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
