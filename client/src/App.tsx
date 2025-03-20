import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./lib/queryClient";
import Navbar from "./components/layout/navbar";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Shipments from "./pages/shipments";
import RateManagement from "./pages/rate-management";
import Tracking from "./pages/tracking";
import About from "./pages/about";
import Contact from "./pages/contact";
import Services from "./pages/services";
import NotFound from "./pages/not-found";
import Shipping from "./pages/shipping"; // Added import
import Solutions from "./pages/solutions"; // Added import
import Locations from "./pages/locations"; // Added import

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/tracking" component={Tracking} />
              <Route path="/shipping" component={Shipping} />
              <Route path="/solutions" component={Solutions} />
              <Route path="/locations" component={Locations} />
              <Route path="/services" component={Services} />
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/shipments" component={Shipments} />
              <Route path="/rate-management" component={RateManagement} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}