
import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { apiRequest } from "@/lib/queryClient";

export default function RateHistory() {
  const [dateRange, setDateRange] = React.useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const { data: rateHistory } = useQuery({
    queryKey: ["rateHistory", dateRange],
    queryFn: () => apiRequest("/api/rates/history", {
      method: "GET",
      params: {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      }
    })
  });

  return (
    <DashboardLayout title="Rate History">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Rate Trends</h2>
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={setDateRange}
          />
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px]">
            <LineChart width={800} height={400} data={rateHistory}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="#8884d8" />
            </LineChart>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
