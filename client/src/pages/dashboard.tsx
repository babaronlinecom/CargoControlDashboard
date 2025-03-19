import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardMetrics } from "@/components/dashboard/metrics";
import { ShipmentsTable } from "@/components/dashboard/shipments-table";
import { ShipmentAnalytics } from "@/components/dashboard/shipment-analytics";
import { RateUploader } from "@/components/dashboard/rate-uploader";
import { AramexIntegration } from "@/components/dashboard/aramex-integration";

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <DashboardMetrics />
      <ShipmentsTable />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ShipmentAnalytics />
        </div>
        <div>
          <RateUploader />
        </div>
      </div>
      
      <AramexIntegration />
    </DashboardLayout>
  );
}
