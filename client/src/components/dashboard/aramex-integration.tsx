import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Truck, 
  Search, 
  MapPin 
} from "lucide-react";

interface ApiStatus {
  connected: boolean;
  lastCall: string;
  responseTime: number;
}

interface ApiIntegrationProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

function ApiIntegration({ 
  icon, 
  iconColor, 
  iconBgColor, 
  title, 
  description, 
  buttonText,
  onClick
}: ApiIntegrationProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center mb-3">
        <div className={`h-8 w-8 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        <h3 className="ml-2 text-sm font-medium text-gray-700">{title}</h3>
      </div>
      <p className="text-xs text-gray-600 mb-3">{description}</p>
      <Button 
        className="w-full bg-primary text-white text-sm"
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </div>
  );
}

export function AramexIntegration() {
  const { data: apiStatus, isLoading } = useQuery<ApiStatus>({
    queryKey: ['/api/aramex/status'],
  });
  
  const handleCalculateRates = () => {
    // Navigate to rate calculator in the Aramex integration page
    window.location.href = "/api-integrations?service=rate-calculator";
  };
  
  const handleViewServices = () => {
    // Navigate to shipping services in the Aramex integration page
    window.location.href = "/api-integrations?service=shipping-services";
  };
  
  const handleTrackShipment = () => {
    // Navigate to tracking in the Aramex integration page
    window.location.href = "/api-integrations?service=tracking";
  };
  
  const handleFindLocations = () => {
    // Navigate to location services in the Aramex integration page
    window.location.href = "/api-integrations?service=location-services";
  };
  
  return (
    <Card className="mt-6">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">Aramex API Integration</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ApiIntegration
            icon={<Calculator className="h-5 w-5" />}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            title="Rate Calculator"
            description="Calculate shipping rates based on weight, dimensions and destination"
            buttonText="Calculate Rates"
            onClick={handleCalculateRates}
          />
          
          <ApiIntegration
            icon={<Truck className="h-5 w-5" />}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            title="Shipping Services"
            description="Access different shipping service types and options"
            buttonText="View Services"
            onClick={handleViewServices}
          />
          
          <ApiIntegration
            icon={<Search className="h-5 w-5" />}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            title="Tracking"
            description="Track shipments and get real-time delivery status"
            buttonText="Track Shipment"
            onClick={handleTrackShipment}
          />
          
          <ApiIntegration
            icon={<MapPin className="h-5 w-5" />}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
            title="Location Services"
            description="Find nearest drop-off locations and service centers"
            buttonText="Find Locations"
            onClick={handleFindLocations}
          />
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">API Connection Status</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-2">
                <div className={`w-2 h-2 rounded-full ${apiStatus?.connected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                <p className="text-sm text-gray-700">
                  API Services: <span className={`${apiStatus?.connected ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {apiStatus?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </p>
              </div>
              <div className="text-xs text-gray-600">
                Last API call: {apiStatus?.lastCall ? new Date(apiStatus.lastCall).toLocaleString() : 'N/A'} | 
                Response time: <span className={`${apiStatus?.responseTime < 300 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {apiStatus?.responseTime}ms
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
