import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Calculator,
  Truck,
  Search,
  MapPin,
  ExternalLink,
  Clipboard,
  Check,
  Plus,
  Clock,
  RefreshCw
} from "lucide-react";

// Service-specific types
interface RateCalculatorParams {
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  weight: number;
  packageType: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

interface TrackingParams {
  trackingNumber: string;
}

interface LocationParams {
  country: string;
  city: string;
}

interface ApiStatus {
  connected: boolean;
  lastCall: string;
  responseTime: number;
}

export default function ApiIntegrations() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const defaultService = params.get("service") || "rate-calculator";
  
  const [activeTab, setActiveTab] = useState(defaultService);
  const { toast } = useToast();
  
  // Rate Calculator State
  const [rateParams, setRateParams] = useState<RateCalculatorParams>({
    originCountry: "",
    originCity: "",
    destinationCountry: "",
    destinationCity: "",
    weight: 1,
    packageType: "box",
    dimensions: {
      length: 10,
      width: 10,
      height: 10
    }
  });
  
  // Tracking State
  const [trackingNumber, setTrackingNumber] = useState("");
  
  // Location Search State
  const [locationParams, setLocationParams] = useState<LocationParams>({
    country: "",
    city: ""
  });
  
  // API Status Query
  const { data: apiStatus, isLoading: isLoadingStatus } = useQuery<ApiStatus>({
    queryKey: ['/api/aramex/status'],
  });
  
  // Rate Calculator Mutation
  const calculateRatesMutation = useMutation({
    mutationFn: async (params: RateCalculatorParams) => {
      return apiRequest('POST', '/api/aramex/calculate-rates', params);
    },
    onSuccess: (data) => {
      toast({
        title: "Rates Calculated",
        description: "Shipping rates have been calculated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Calculation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Tracking Mutation
  const trackShipmentMutation = useMutation({
    mutationFn: async (params: TrackingParams) => {
      return apiRequest('POST', '/api/aramex/track', params);
    },
    onSuccess: (data) => {
      toast({
        title: "Tracking Successful",
        description: "Shipment tracking information retrieved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Tracking Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Location Services Mutation
  const findLocationsMutation = useMutation({
    mutationFn: async (params: LocationParams) => {
      return apiRequest('POST', '/api/aramex/locations', params);
    },
    onSuccess: (data) => {
      toast({
        title: "Locations Found",
        description: "Found Aramex service locations matching your search",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handler functions
  const handleCalculateRates = () => {
    calculateRatesMutation.mutate(rateParams);
  };
  
  const handleTrackShipment = () => {
    if (!trackingNumber) {
      toast({
        title: "Tracking Number Required",
        description: "Please enter a valid tracking number",
        variant: "destructive",
      });
      return;
    }
    
    trackShipmentMutation.mutate({ trackingNumber });
  };
  
  const handleFindLocations = () => {
    if (!locationParams.country) {
      toast({
        title: "Country Required",
        description: "Please enter a country for location search",
        variant: "destructive",
      });
      return;
    }
    
    findLocationsMutation.mutate(locationParams);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API endpoint copied to clipboard"
    });
  };
  
  const refreshApiStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/aramex/status'] });
  };
  
  return (
    <DashboardLayout title="API Integrations">
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Aramex API Integration</CardTitle>
                <CardDescription>
                  Integrate shipping services with the Aramex API
                </CardDescription>
              </div>
              
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${
                  apiStatus?.connected ? 'bg-green-500' : 'bg-red-500'
                } mr-2`}></div>
                <span className="text-sm">
                  {isLoadingStatus ? "Checking status..." :
                    apiStatus?.connected ? "Connected" : "Disconnected"}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2" 
                  onClick={refreshApiStatus}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                The Aramex API provides comprehensive shipping services including rate calculation, 
                shipment tracking, and location services. Use the tabs below to access different API functionalities.
              </p>
            </div>
            
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="rate-calculator" className="flex items-center">
                  <Calculator className="mr-2 h-4 w-4" /> Rate Calculator
                </TabsTrigger>
                <TabsTrigger value="shipping-services" className="flex items-center">
                  <Truck className="mr-2 h-4 w-4" /> Shipping Services
                </TabsTrigger>
                <TabsTrigger value="tracking" className="flex items-center">
                  <Search className="mr-2 h-4 w-4" /> Tracking
                </TabsTrigger>
                <TabsTrigger value="location-services" className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" /> Location Services
                </TabsTrigger>
              </TabsList>
              
              {/* Rate Calculator Tab */}
              <TabsContent value="rate-calculator">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Calculate Shipping Rates</CardTitle>
                      <CardDescription>Get accurate shipping rates based on package details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="originCountry">Origin Country</Label>
                            <Input
                              id="originCountry"
                              placeholder="e.g. United Arab Emirates"
                              value={rateParams.originCountry}
                              onChange={(e) => setRateParams({...rateParams, originCountry: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="originCity">Origin City</Label>
                            <Input
                              id="originCity"
                              placeholder="e.g. Dubai"
                              value={rateParams.originCity}
                              onChange={(e) => setRateParams({...rateParams, originCity: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="destinationCountry">Destination Country</Label>
                            <Input
                              id="destinationCountry"
                              placeholder="e.g. Saudi Arabia"
                              value={rateParams.destinationCountry}
                              onChange={(e) => setRateParams({...rateParams, destinationCountry: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="destinationCity">Destination City</Label>
                            <Input
                              id="destinationCity"
                              placeholder="e.g. Riyadh"
                              value={rateParams.destinationCity}
                              onChange={(e) => setRateParams({...rateParams, destinationCity: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={rateParams.weight}
                              onChange={(e) => setRateParams({...rateParams, weight: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="packageType">Package Type</Label>
                            <Select
                              value={rateParams.packageType}
                              onValueChange={(value) => setRateParams({...rateParams, packageType: value})}
                            >
                              <SelectTrigger id="packageType">
                                <SelectValue placeholder="Select package type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="box">Box</SelectItem>
                                <SelectItem value="envelope">Envelope</SelectItem>
                                <SelectItem value="pallet">Pallet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Dimensions (cm)</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <Input
                              placeholder="Length"
                              type="number"
                              min="1"
                              value={rateParams.dimensions.length}
                              onChange={(e) => setRateParams({
                                ...rateParams,
                                dimensions: {
                                  ...rateParams.dimensions,
                                  length: parseFloat(e.target.value)
                                }
                              })}
                            />
                            <Input
                              placeholder="Width"
                              type="number"
                              min="1"
                              value={rateParams.dimensions.width}
                              onChange={(e) => setRateParams({
                                ...rateParams,
                                dimensions: {
                                  ...rateParams.dimensions,
                                  width: parseFloat(e.target.value)
                                }
                              })}
                            />
                            <Input
                              placeholder="Height"
                              type="number"
                              min="1"
                              value={rateParams.dimensions.height}
                              onChange={(e) => setRateParams({
                                ...rateParams,
                                dimensions: {
                                  ...rateParams.dimensions,
                                  height: parseFloat(e.target.value)
                                }
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-primary" 
                        onClick={handleCalculateRates}
                        disabled={calculateRatesMutation.isPending}
                      >
                        {calculateRatesMutation.isPending ? "Calculating..." : "Calculate Rates"}
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>API Response</CardTitle>
                      <CardDescription>Shipping rate calculation results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {calculateRatesMutation.isPending ? (
                        <div className="py-10 flex justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                      ) : calculateRatesMutation.isSuccess ? (
                        <div className="space-y-4">
                          <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                              <Check className="h-5 w-5 text-green-400" />
                              <p className="ml-3 text-sm font-medium text-green-800">Rates calculated successfully</p>
                            </div>
                          </div>
                          
                          <div className="rounded-md border p-4">
                            <pre className="text-xs overflow-auto">
                              {JSON.stringify(calculateRatesMutation.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : calculateRatesMutation.isError ? (
                        <div className="rounded-md bg-red-50 p-4">
                          <p className="text-sm text-red-800">Error: {calculateRatesMutation.error.message}</p>
                        </div>
                      ) : (
                        <div className="py-10 text-center text-gray-500">
                          Fill out the form and click calculate to see rates
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Shipping Services Tab */}
              <TabsContent value="shipping-services">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Express Shipping</CardTitle>
                      <CardDescription>Fast, time-sensitive delivery services</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>International Express</span>
                        </li>
                        <li className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>Domestic Express</span>
                        </li>
                        <li className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>Express Freight</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Express API Docs
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Logistics Solutions</CardTitle>
                      <CardDescription>Comprehensive shipping logistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-primary" />
                          <span>Land Freight</span>
                        </li>
                        <li className="flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-primary" />
                          <span>Shop & Ship</span>
                        </li>
                        <li className="flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-primary" />
                          <span>Fulfillment Services</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Logistics API Docs
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Services</CardTitle>
                      <CardDescription>Value-added shipping options</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <Plus className="h-4 w-4 mr-2 text-primary" />
                          <span>COD (Cash on Delivery)</span>
                        </li>
                        <li className="flex items-center">
                          <Plus className="h-4 w-4 mr-2 text-primary" />
                          <span>Insurance</span>
                        </li>
                        <li className="flex items-center">
                          <Plus className="h-4 w-4 mr-2 text-primary" />
                          <span>Priority Handling</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Add-on API Docs
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>API Documentation</CardTitle>
                    <CardDescription>Reference for shipping services API endpoints</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="create-shipment">
                        <AccordionTrigger>Create Shipment API</AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-mono text-sm">POST /api/aramex/shipments/create</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyToClipboard('/api/aramex/shipments/create')}
                              >
                                <Clipboard className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Creates a new shipment in the Aramex system and returns a shipping label and tracking number.
                            </p>
                            <div className="text-xs">
                              <p className="font-medium mb-1">Required parameters:</p>
                              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
{`{
  "shipper": {
    "name": "Sender Name",
    "phone": "+971501234567",
    "email": "sender@example.com",
    "address": {
      "line1": "Address Line 1",
      "city": "Dubai",
      "country": "AE"
    }
  },
  "recipient": {
    "name": "Recipient Name",
    "phone": "+966501234567",
    "email": "recipient@example.com",
    "address": {
      "line1": "Address Line 1",
      "city": "Riyadh",
      "country": "SA"
    }
  },
  "package": {
    "weight": 5,
    "dimensions": {
      "length": 20,
      "width": 15,
      "height": 10
    },
    "description": "Package description"
  },
  "service": "EXPRESS",
  "payment": {
    "type": "PREPAID"
  }
}`}
                              </pre>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="pickup-request">
                        <AccordionTrigger>Schedule Pickup API</AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-mono text-sm">POST /api/aramex/pickups/create</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyToClipboard('/api/aramex/pickups/create')}
                              >
                                <Clipboard className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Schedules a pickup request with Aramex for one or more shipments.
                            </p>
                            <div className="text-xs">
                              <p className="font-medium mb-1">Required parameters:</p>
                              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
{`{
  "pickup": {
    "location": {
      "address": {
        "line1": "Address Line 1",
        "city": "Dubai",
        "country": "AE"
      },
      "contact": {
        "name": "Contact Name",
        "phone": "+971501234567",
        "email": "contact@example.com"
      }
    },
    "date": "2023-09-15",
    "timeWindow": {
      "from": "09:00",
      "to": "17:00"
    },
    "shipmentCount": 1,
    "shipmentWeight": 5
  }
}`}
                              </pre>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="cancel-shipment">
                        <AccordionTrigger>Cancel Shipment API</AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 border rounded-md">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-mono text-sm">POST /api/aramex/shipments/cancel</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyToClipboard('/api/aramex/shipments/cancel')}
                              >
                                <Clipboard className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Cancels an existing shipment that has not yet been picked up.
                            </p>
                            <div className="text-xs">
                              <p className="font-medium mb-1">Required parameters:</p>
                              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
{`{
  "shipmentNumber": "ARX-12345-6",
  "reason": "Customer requested cancellation"
}`}
                              </pre>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Tracking Tab */}
              <TabsContent value="tracking">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Track Shipment</CardTitle>
                      <CardDescription>Get real-time tracking information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="trackingNumber">Tracking Number</Label>
                          <Input
                            id="trackingNumber"
                            placeholder="e.g. ARX-12345-6"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                          />
                          <p className="text-xs text-gray-500">
                            Enter a valid Aramex tracking number to get the most recent status
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-primary" 
                        onClick={handleTrackShipment}
                        disabled={trackShipmentMutation.isPending}
                      >
                        {trackShipmentMutation.isPending ? "Tracking..." : "Track Shipment"}
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Tracking Results</CardTitle>
                      <CardDescription>Current shipment status and history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {trackShipmentMutation.isPending ? (
                        <div className="py-10 flex justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                      ) : trackShipmentMutation.isSuccess ? (
                        <div className="space-y-4">
                          <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                              <Check className="h-5 w-5 text-green-400" />
                              <p className="ml-3 text-sm font-medium text-green-800">
                                Shipment tracking information retrieved
                              </p>
                            </div>
                          </div>
                          
                          <div className="rounded-md border p-4">
                            <pre className="text-xs overflow-auto">
                              {JSON.stringify(trackShipmentMutation.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : trackShipmentMutation.isError ? (
                        <div className="rounded-md bg-red-50 p-4">
                          <p className="text-sm text-red-800">Error: {trackShipmentMutation.error.message}</p>
                        </div>
                      ) : (
                        <div className="py-10 text-center text-gray-500">
                          Enter a tracking number and click track to see results
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Location Services Tab */}
              <TabsContent value="location-services">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Find Aramex Locations</CardTitle>
                      <CardDescription>Search for drop-off points and service centers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="locationCountry">Country</Label>
                          <Input
                            id="locationCountry"
                            placeholder="e.g. United Arab Emirates"
                            value={locationParams.country}
                            onChange={(e) => setLocationParams({...locationParams, country: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="locationCity">City (Optional)</Label>
                          <Input
                            id="locationCity"
                            placeholder="e.g. Dubai"
                            value={locationParams.city}
                            onChange={(e) => setLocationParams({...locationParams, city: e.target.value})}
                          />
                          <p className="text-xs text-gray-500">
                            Leave city blank to search all locations in the country
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-primary" 
                        onClick={handleFindLocations}
                        disabled={findLocationsMutation.isPending}
                      >
                        {findLocationsMutation.isPending ? "Searching..." : "Find Locations"}
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Search Results</CardTitle>
                      <CardDescription>Aramex service locations matching your search</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {findLocationsMutation.isPending ? (
                        <div className="py-10 flex justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                      ) : findLocationsMutation.isSuccess ? (
                        <div className="space-y-4">
                          <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                              <Check className="h-5 w-5 text-green-400" />
                              <p className="ml-3 text-sm font-medium text-green-800">
                                Found {findLocationsMutation.data?.locations?.length || 0} locations
                              </p>
                            </div>
                          </div>
                          
                          <div className="rounded-md border p-4">
                            <pre className="text-xs overflow-auto">
                              {JSON.stringify(findLocationsMutation.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : findLocationsMutation.isError ? (
                        <div className="rounded-md bg-red-50 p-4">
                          <p className="text-sm text-red-800">Error: {findLocationsMutation.error.message}</p>
                        </div>
                      ) : (
                        <div className="py-10 text-center text-gray-500">
                          Enter search criteria and click find to see locations
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
