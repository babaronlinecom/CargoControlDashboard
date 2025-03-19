import React from "react";
import { 
  Package, 
  Truck, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface MetricCardProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: number;
  change: number;
  changePeriod: string;
}

function MetricCard({ 
  icon, 
  iconColor, 
  iconBgColor, 
  title, 
  value, 
  change, 
  changePeriod 
}: MetricCardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${iconBgColor} ${iconColor}`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-xl font-semibold">{value.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center text-sm">
          <span className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? (
              <TrendingUp className="mr-1 h-4 w-4" />
            ) : (
              <TrendingDown className="mr-1 h-4 w-4" />
            )}
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-gray-500 ml-2">from {changePeriod}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardMetrics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/metrics'],
  });

  // Default metrics if API call is still loading
  const defaultMetrics = {
    totalShipments: { value: 0, change: 0, period: "last month" },
    activeDeliveries: { value: 0, change: 0, period: "last week" },
    pendingApproval: { value: 0, change: 0, period: "last week" },
    deliveryIssues: { value: 0, change: 0, period: "last week" }
  };

  const {
    totalShipments,
    activeDeliveries,
    pendingApproval,
    deliveryIssues
  } = metrics || defaultMetrics;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="pt-6 h-28 flex items-center justify-center">
              <div className="w-full h-12 bg-gray-200 animate-pulse rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        icon={<Package className="h-5 w-5" />}
        iconColor="text-primary"
        iconBgColor="bg-blue-100"
        title="Total Shipments"
        value={totalShipments.value}
        change={totalShipments.change}
        changePeriod={totalShipments.period}
      />
      
      <MetricCard
        icon={<Truck className="h-5 w-5" />}
        iconColor="text-green-500"
        iconBgColor="bg-green-100"
        title="Active Deliveries"
        value={activeDeliveries.value}
        change={activeDeliveries.change}
        changePeriod={activeDeliveries.period}
      />
      
      <MetricCard
        icon={<Clock className="h-5 w-5" />}
        iconColor="text-yellow-500"
        iconBgColor="bg-yellow-100"
        title="Pending Approval"
        value={pendingApproval.value}
        change={pendingApproval.change}
        changePeriod={pendingApproval.period}
      />
      
      <MetricCard
        icon={<AlertTriangle className="h-5 w-5" />}
        iconColor="text-red-500"
        iconBgColor="bg-red-100"
        title="Delivery Issues"
        value={deliveryIssues.value}
        change={deliveryIssues.change}
        changePeriod={deliveryIssues.period}
      />
    </div>
  );
}
