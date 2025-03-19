import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackShipment } from "@/lib/api";

interface TrackingResult {
  status: string;
  location: string;
  timestamp: string;
  details: string;
}

export function AramexTracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(
    null
  );
  const { toast } = useToast();

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await trackShipment({ trackingNumber });
      setTrackingResult(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to track shipment. Please try again.",
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
          <Package className="h-6 w-6" />
          Track Your Shipment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Input
            placeholder="Enter your tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleTrack}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              "Tracking..."
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Track
              </>
            )}
          </Button>
        </div>

        {trackingResult && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
              <Truck className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">{trackingResult.status}</h3>
                <p className="text-sm text-gray-600">
                  {trackingResult.location} - {trackingResult.timestamp}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700">{trackingResult.details}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
