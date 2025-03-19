
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ApiIntegrations() {
  const [activeTab, setActiveTab] = useState("tracking");

  return (
    <DashboardLayout title="API Integrations">
      <div className="mb-8">
        <Card>
          <CardHeader>API Services</CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="tracking">
                {/* Tracking Content */}
              </TabsContent>
              <TabsContent value="location-services">
                {/* Location Services Content */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
