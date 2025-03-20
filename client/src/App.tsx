import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./lib/queryClient";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Shipments from "./pages/shipments";
import RateManagement from "./pages/rate-management";
import Invoices from "./pages/invoices";
import Navbar from "./components/layout/navbar";
import NotFound from "@/pages/not-found";
import ApiIntegrations from "@/pages/api-integrations";
import Analytics from "@/pages/analytics";
import Payments from "@/pages/payments";


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Navbar />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/shipments" component={Shipments} />
          <Route path="/rate-management" component={RateManagement} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/api-integrations" component={ApiIntegrations} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/payments" component={Payments} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}