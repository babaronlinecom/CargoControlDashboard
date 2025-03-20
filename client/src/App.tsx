import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Shipments from "@/pages/shipments";
import RateManagement from "@/pages/rate-management";
import ApiIntegrations from "@/pages/api-integrations";
import Analytics from "@/pages/analytics";
import Invoices from "@/pages/invoices";
import Payments from "@/pages/payments";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/shipments" component={Shipments} />
      <Route path="/rate-management" component={RateManagement} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/payments" component={Payments} />
      <Route path="/api-integrations" component={ApiIntegrations} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
