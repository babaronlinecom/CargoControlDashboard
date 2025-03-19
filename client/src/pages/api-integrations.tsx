import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { ShipmentForm } from "@/components/forms/shipment-form";
import { PickupForm } from "@/components/forms/pickup-form";
import { TrackingForm } from "@/components/forms/tracking-form";
import { LocationForm } from "@/components/forms/location-form";

export default function ApiIntegrations() {
  const [activeTab, setActiveTab] = useState("shipments");

  return (
    <DashboardLayout title="API Integrations">
      <div className="mb-8">
        <Card>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="shipments">
                <ShipmentForm />
              </TabsContent>
              <TabsContent value="pickups">
                <PickupForm />
              </TabsContent>
              <TabsContent value="tracking">
                <TrackingForm />
              </TabsContent>
              <TabsContent value="location-services">
                <LocationForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}