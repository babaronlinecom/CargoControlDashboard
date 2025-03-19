import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calculateShippingRates } from "@/lib/api";

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

export function AramexRateCalculator() {
  const [params, setParams] = useState<RateCalculatorParams>({
    originCountry: "",
    originCity: "",
    destinationCountry: "",
    destinationCity: "",
    weight: 1,
    packageType: "box",
    dimensions: {
      length: 10,
      width: 10,
      height: 10,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCalculate = async () => {
    if (!params.originCountry || !params.destinationCountry) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await calculateShippingRates(params);
      toast({
        title: "Success",
        description: "Shipping rates calculated successfully",
      });
      // Handle the rate calculation result here
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate rates. Please try again.",
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
          <Calculator className="h-6 w-6" />
          Calculate Shipping Rates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Origin</h3>
            <Input
              placeholder="Country"
              value={params.originCountry}
              onChange={(e) =>
                setParams({ ...params, originCountry: e.target.value })
              }
            />
            <Input
              placeholder="City"
              value={params.originCity}
              onChange={(e) =>
                setParams({ ...params, originCity: e.target.value })
              }
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Destination</h3>
            <Input
              placeholder="Country"
              value={params.destinationCountry}
              onChange={(e) =>
                setParams({ ...params, destinationCountry: e.target.value })
              }
            />
            <Input
              placeholder="City"
              value={params.destinationCity}
              onChange={(e) =>
                setParams({ ...params, destinationCity: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Package Type</h3>
            <Select
              value={params.packageType}
              onValueChange={(value) =>
                setParams({ ...params, packageType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="box">Box</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="pallet">Pallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Weight (kg)</h3>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={params.weight}
              onChange={(e) =>
                setParams({ ...params, weight: parseFloat(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Dimensions (cm)</h3>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="L"
                value={params.dimensions.length}
                onChange={(e) =>
                  setParams({
                    ...params,
                    dimensions: {
                      ...params.dimensions,
                      length: parseFloat(e.target.value),
                    },
                  })
                }
              />
              <Input
                type="number"
                placeholder="W"
                value={params.dimensions.width}
                onChange={(e) =>
                  setParams({
                    ...params,
                    dimensions: {
                      ...params.dimensions,
                      width: parseFloat(e.target.value),
                    },
                  })
                }
              />
              <Input
                type="number"
                placeholder="H"
                value={params.dimensions.height}
                onChange={(e) =>
                  setParams({
                    ...params,
                    dimensions: {
                      ...params.dimensions,
                      height: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={isLoading}
          className="w-full mt-6"
        >
          {isLoading ? "Calculating..." : "Calculate Rates"}
        </Button>
      </CardContent>
    </Card>
  );
}
