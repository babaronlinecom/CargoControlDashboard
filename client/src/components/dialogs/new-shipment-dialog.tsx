import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createShipment } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface NewShipmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewShipmentDialog({ isOpen, onClose }: NewShipmentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    destination: "",
    customerName: "",
    origin: "",
    weight: "",
    serviceType: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
  });

  const createShipmentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return createShipment({
        ...data,
        status: "pending",
        date: new Date().toISOString(),
        dimensions: JSON.stringify(data.dimensions),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({
        title: "Shipment created",
        description: "New shipment has been created successfully",
      });
      onClose();
      setFormData({
        destination: "",
        customerName: "",
        origin: "",
        weight: "",
        serviceType: "",
        dimensions: {
          length: "",
          width: "",
          height: "",
        },
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create shipment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createShipmentMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="customerName">Customer Name</label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="origin">Origin</label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) =>
                setFormData({ ...formData, origin: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="destination">Destination</label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="weight">Weight (kg)</label>
            <Input
              id="weight"
              type="number"
              min="0"
              step="0.1"
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="serviceType">Service Type</label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) =>
                setFormData({ ...formData, serviceType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="economy">Economy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label htmlFor="length">Length (cm)</label>
              <Input
                id="length"
                type="number"
                min="0"
                value={formData.dimensions.length}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      length: e.target.value,
                    },
                  })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="width">Width (cm)</label>
              <Input
                id="width"
                type="number"
                min="0"
                value={formData.dimensions.width}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      width: e.target.value,
                    },
                  })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="height">Height (cm)</label>
              <Input
                id="height"
                type="number"
                min="0"
                value={formData.dimensions.height}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      height: e.target.value,
                    },
                  })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createShipmentMutation.isPending}>
              {createShipmentMutation.isPending
                ? "Creating..."
                : "Create Shipment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
