import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { findServiceLocations } from "@/lib/api";

interface LocationParams {
  country: string;
  city?: string;
}

interface ServiceLocation {
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  services: string[];
}

export function AramexLocationServices() {
  const [params, setParams] = useState<LocationParams>({
    country: "",
    city: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!params.country) {
      toast({
        title: "Error",
        description: "Please enter a country name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await findServiceLocations(params);
      setLocations(result);
      if (result.length === 0) {
        toast({
          title: "No Results",
          description: "No service locations found for the given criteria",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find service locations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          Find Aramex Locations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-4 mb-8">
          <Input
            placeholder="Enter country"
            value={params.country}
            onChange={(e) => setParams({ ...params, country: e.target.value })}
            className="flex-1"
          />
          <Input
            placeholder="Enter city (optional)"
            value={params.city}
            onChange={(e) => setParams({ ...params, city: e.target.value })}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {locations.length > 0 && (
          <div className="space-y-4">
            {locations.map((location, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {location.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {location.address}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Phone:</span>{" "}
                      {location.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Hours:</span>{" "}
                      {location.workingHours}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {location.services.map((service, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-primary/5 text-primary text-xs rounded"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
