import React, { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Chart from "chart.js/auto";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Package, Truck, MapPin } from "lucide-react";

// Types for analytics data
interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

interface ShipmentsByDestination {
  labels: string[];
  data: number[];
  backgroundColor: string[];
}

interface ShipmentStatistics {
  totalShipments: number;
  percentChange: number;
  avgDeliveryTime: number;
  deliveryTimeChange: number;
  onTimePercentage: number;
  onTimeChange: number;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30days");
  const [chartType, setChartType] = useState("volume");
  
  const shipmentTrendsRef = useRef<HTMLCanvasElement | null>(null);
  const shipmentDestinationsRef = useRef<HTMLCanvasElement | null>(null);
  const serviceTypeRef = useRef<HTMLCanvasElement | null>(null);
  
  const shipmentTrendsChartRef = useRef<Chart | null>(null);
  const shipmentDestinationsChartRef = useRef<Chart | null>(null);
  const serviceTypeChartRef = useRef<Chart | null>(null);
  
  // Fetch analytics data based on selected time range
  const { data: shipmentTrends, isLoading: isTrendsLoading } = useQuery<TimeSeriesData>({
    queryKey: ["/api/analytics/shipments/trends", timeRange, chartType],
  });
  
  const { data: shipmentsByDestination, isLoading: isDestinationsLoading } = useQuery<ShipmentsByDestination>({
    queryKey: ["/api/analytics/shipments/destinations", timeRange],
  });
  
  const { data: shipmentsByService, isLoading: isServiceLoading } = useQuery<ShipmentsByDestination>({
    queryKey: ["/api/analytics/shipments/services", timeRange],
  });
  
  const { data: statistics, isLoading: isStatsLoading } = useQuery<ShipmentStatistics>({
    queryKey: ["/api/analytics/statistics", timeRange],
  });
  
  // Initialize and update shipment trends chart
  useEffect(() => {
    if (!shipmentTrendsRef.current || !shipmentTrends || isTrendsLoading) return;
    
    // Destroy existing chart instance if it exists
    if (shipmentTrendsChartRef.current) {
      shipmentTrendsChartRef.current.destroy();
    }
    
    // Create new chart
    const ctx = shipmentTrendsRef.current.getContext("2d");
    if (ctx) {
      shipmentTrendsChartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: shipmentTrends.labels,
          datasets: shipmentTrends.datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                drawBorder: false,
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }
    
    // Cleanup on component unmount
    return () => {
      if (shipmentTrendsChartRef.current) {
        shipmentTrendsChartRef.current.destroy();
      }
    };
  }, [shipmentTrends, isTrendsLoading]);
  
  // Initialize and update destinations chart
  useEffect(() => {
    if (!shipmentDestinationsRef.current || !shipmentsByDestination || isDestinationsLoading) return;
    
    // Destroy existing chart instance if it exists
    if (shipmentDestinationsChartRef.current) {
      shipmentDestinationsChartRef.current.destroy();
    }
    
    // Create new chart
    const ctx = shipmentDestinationsRef.current.getContext("2d");
    if (ctx) {
      shipmentDestinationsChartRef.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: shipmentsByDestination.labels,
          datasets: [
            {
              data: shipmentsByDestination.data,
              backgroundColor: shipmentsByDestination.backgroundColor,
              borderWidth: 1,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
          },
        },
      });
    }
    
    // Cleanup on component unmount
    return () => {
      if (shipmentDestinationsChartRef.current) {
        shipmentDestinationsChartRef.current.destroy();
      }
    };
  }, [shipmentsByDestination, isDestinationsLoading]);
  
  // Initialize and update service type chart
  useEffect(() => {
    if (!serviceTypeRef.current || !shipmentsByService || isServiceLoading) return;
    
    // Destroy existing chart instance if it exists
    if (serviceTypeChartRef.current) {
      serviceTypeChartRef.current.destroy();
    }
    
    // Create new chart
    const ctx = serviceTypeRef.current.getContext("2d");
    if (ctx) {
      serviceTypeChartRef.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: shipmentsByService.labels,
          datasets: [
            {
              data: shipmentsByService.data,
              backgroundColor: shipmentsByService.backgroundColor,
              borderWidth: 1,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
          },
        },
      });
    }
    
    // Cleanup on component unmount
    return () => {
      if (serviceTypeChartRef.current) {
        serviceTypeChartRef.current.destroy();
      }
    };
  }, [shipmentsByService, isServiceLoading]);
  
  return (
    <DashboardLayout title="Analytics & Reporting">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shipment Analytics</h1>
            <p className="text-gray-500 mt-1">
              View and analyze shipment trends and performance metrics
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Shipments</p>
                  {isStatsLoading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold">{statistics?.totalShipments.toLocaleString()}</p>
                  )}
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-primary">
                  <Package size={20} />
                </div>
              </div>
              
              {isStatsLoading ? (
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded mt-4"></div>
              ) : (
                <div className="mt-4 flex items-center text-sm">
                  {statistics && statistics.percentChange >= 0 ? (
                    <>
                      <span className="text-green-500 flex items-center">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        {statistics.percentChange.toFixed(1)}%
                      </span>
                      <span className="text-gray-500 ml-2">from previous period</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-500 flex items-center">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        {statistics && Math.abs(statistics.percentChange).toFixed(1)}%
                      </span>
                      <span className="text-gray-500 ml-2">from previous period</span>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg. Delivery Time</p>
                  {isStatsLoading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold">{statistics?.avgDeliveryTime.toFixed(1)} days</p>
                  )}
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-500">
                  <Truck size={20} />
                </div>
              </div>
              
              {isStatsLoading ? (
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded mt-4"></div>
              ) : (
                <div className="mt-4 flex items-center text-sm">
                  {statistics && statistics.deliveryTimeChange <= 0 ? (
                    <>
                      <span className="text-green-500 flex items-center">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        {Math.abs(statistics.deliveryTimeChange).toFixed(1)}%
                      </span>
                      <span className="text-gray-500 ml-2">faster than previous</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-500 flex items-center">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        {statistics && statistics.deliveryTimeChange.toFixed(1)}%
                      </span>
                      <span className="text-gray-500 ml-2">slower than previous</span>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">On-Time Delivery</p>
                  {isStatsLoading ? (
                    <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold">{statistics?.onTimePercentage.toFixed(1)}%</p>
                  )}
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                  <TrendingUp size={20} />
                </div>
              </div>
              
              {isStatsLoading ? (
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded mt-4"></div>
              ) : (
                <div className="mt-4 flex items-center text-sm">
                  {statistics && statistics.onTimeChange >= 0 ? (
                    <>
                      <span className="text-green-500 flex items-center">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        {statistics.onTimeChange.toFixed(1)}%
                      </span>
                      <span className="text-gray-500 ml-2">from previous period</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-500 flex items-center">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        {statistics && Math.abs(statistics.onTimeChange).toFixed(1)}%
                      </span>
                      <span className="text-gray-500 ml-2">from previous period</span>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Shipment Trends Chart */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Shipment Trends</CardTitle>
                <CardDescription>Overview of shipment volumes and trends over time</CardDescription>
              </div>
              <Select
                value={chartType}
                onValueChange={setChartType}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">Shipment Volume</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="weight">Weight (kg)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isTrendsLoading ? (
              <div className="h-[350px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="h-[350px]">
                <canvas ref={shipmentTrendsRef}></canvas>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Distribution Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipments by Destination</CardTitle>
              <CardDescription>Distribution of shipments across top destinations</CardDescription>
            </CardHeader>
            <CardContent>
              {isDestinationsLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="h-[300px]">
                  <canvas ref={shipmentDestinationsRef}></canvas>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Shipments by Service Type</CardTitle>
              <CardDescription>Distribution of shipments by service category</CardDescription>
            </CardHeader>
            <CardContent>
              {isServiceLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="h-[300px]">
                  <canvas ref={serviceTypeRef}></canvas>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Rate Analysis Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Rate Analysis</h2>
        
        <Tabs defaultValue="trends">
          <TabsList className="mb-4">
            <TabsTrigger value="trends">Rate Trends</TabsTrigger>
            <TabsTrigger value="comparison">Destination Comparison</TabsTrigger>
            <TabsTrigger value="changes">Recent Changes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Rate Trends by Destination</CardTitle>
                <CardDescription>Average shipping rates over time for top destinations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] flex items-center justify-center">
                  <p className="text-gray-500">Select a destination to view rate trends</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Rate Comparison</CardTitle>
                <CardDescription>Compare shipping rates across destinations and service types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] flex items-center justify-center">
                  <p className="text-gray-500">Select destinations to compare rates</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="changes">
            <Card>
              <CardHeader>
                <CardTitle>Recent Rate Changes</CardTitle>
                <CardDescription>Summary of rate changes in the past period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] flex items-center justify-center">
                  <p className="text-gray-500">No recent rate changes detected</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Custom Reports Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Custom Reports</h2>
        <Card>
          <CardHeader>
            <CardTitle>Generate Custom Reports</CardTitle>
            <CardDescription>Create and download custom analytics reports</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Custom reporting is coming soon</p>
            <p className="text-gray-500 text-center max-w-md mb-4">
              We're working on advanced custom reporting features to help you gain deeper insights
              into your shipping operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
