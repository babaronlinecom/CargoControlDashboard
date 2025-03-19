import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Download, Filter } from "lucide-react";

export function AdvancedAnalytics() {
  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    serviceType: "",
    startDate: "",
    endDate: "",
  });

  const [exportFormat, setExportFormat] = useState("csv");

  // Fetch historical rate data
  const { data: rateAnalysis, isLoading } = useQuery({
    queryKey: ["/api/rates/analysis", filters],
    enabled: Boolean(
      filters.origin &&
        filters.destination &&
        filters.startDate &&
        filters.endDate
    ),
  });

  // Handle export
  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/rates/export?format=${exportFormat}&dateRange=${filters.startDate},${filters.endDate}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rate-analysis.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Rate Analysis & Trends
          </CardTitle>
          <div className="flex gap-2">
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Export as..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Origin"
            value={filters.origin}
            onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
          />
          <Input
            placeholder="Destination"
            value={filters.destination}
            onChange={(e) =>
              setFilters({ ...filters, destination: e.target.value })
            }
          />
          <Select
            value={filters.serviceType}
            onValueChange={(value) =>
              setFilters({ ...filters, serviceType: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="express">Express</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="economy">Economy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DateRangePicker
          onChange={({ from, to }) =>
            setFilters({
              ...filters,
              startDate: from.toISOString(),
              endDate: to.toISOString(),
            })
          }
          className="mb-6"
        />

        {isLoading ? (
          <div className="w-full py-10 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : rateAnalysis ? (
          <div className="overflow-x-auto">
            <LineChart width={800} height={400} data={rateAnalysis.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="#8884d8" />
            </LineChart>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">
                  Average Rate
                </h3>
                <p className="text-2xl font-bold text-blue-900">
                  ${rateAnalysis.averageRate.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">
                  Lowest Rate
                </h3>
                <p className="text-2xl font-bold text-green-900">
                  ${rateAnalysis.lowestRate.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800">
                  Highest Rate
                </h3>
                <p className="text-2xl font-bold text-purple-900">
                  ${rateAnalysis.highestRate.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Select filters to view rate analysis
          </div>
        )}
      </CardContent>
    </Card>
  );
}
