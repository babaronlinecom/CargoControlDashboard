
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrackingForm } from "@/components/api-integration/tracking-form";
import { LocationServices } from "@/components/api-integration/location-services";

export default function ApiIntegrations() {
  const [activeTab, setActiveTab] = useState("tracking");

  return (
    <DashboardLayout title="API Integrations">
      <div className="mb-8">
        <Card>
          <CardHeader>API Services</CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
                <TabsTrigger value="location-services">Location Services</TabsTrigger>
              </TabsList>
              <TabsContent value="tracking">
                <TrackingForm />
              </TabsContent>
              <TabsContent value="location-services">
                <LocationServices />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
