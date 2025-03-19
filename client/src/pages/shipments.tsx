import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Filter,
  Eye, 
  Edit, 
  MoreHorizontal,
  Calendar,
  FileText,
  Package,
  MapPin,
  User
} from "lucide-react";
import { Shipment } from "@shared/schema";

export default function Shipments() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30days");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const { toast } = useToast();
  
  const perPage = 10;
  
  const { data: shipments, isLoading } = useQuery<Shipment[]>({
    queryKey: ['/api/shipments', statusFilter, dateFilter],
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return apiRequest('PATCH', `/api/shipments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shipments'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Status updated",
        description: "Shipment status has been updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const addNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number, note: string }) => {
      return apiRequest('POST', `/api/shipments/${id}/notes`, { text: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shipments'] });
      setNoteText("");
      toast({
        title: "Note added",
        description: "Your note has been added to the shipment"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add note",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Filter shipments by search query
  const filteredShipments = shipments?.filter(shipment => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      shipment.trackingNumber.toLowerCase().includes(query) ||
      shipment.destination.toLowerCase().includes(query) ||
      shipment.customerName.toLowerCase().includes(query)
    );
  });
  
  // Pagination logic
  const totalShipments = filteredShipments?.length || 0;
  const totalPages = Math.ceil(totalShipments / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalShipments);
  const paginatedShipments = filteredShipments?.slice(startIndex, endIndex) || [];
  
  // Function to determine status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleViewShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsViewDialogOpen(true);
  };
  
  const handleEditShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsEditDialogOpen(true);
  };
  
  const handleStatusChange = (status: string) => {
    if (!selectedShipment) return;
    updateStatusMutation.mutate({ id: selectedShipment.id, status });
  };
  
  const handleAddNote = () => {
    if (!selectedShipment || !noteText.trim()) return;
    addNoteMutation.mutate({ id: selectedShipment.id, note: noteText });
  };
  
  return (
    <DashboardLayout title="Shipment Management">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Shipments</CardTitle>
              <CardDescription>Manage, track and update your shipments</CardDescription>
            </div>
            <Button className="mt-4 md:mt-0 bg-primary">
              <Plus className="mr-2 h-4 w-4" /> New Shipment
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4 md:mb-0">
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={dateFilter}
                  onValueChange={setDateFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Last 30 days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="7days">Last week</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="thismonth">This month</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" className="md:ml-4">
                <Filter className="mr-2 h-4 w-4" /> More Filters
              </Button>
            </div>
            
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search shipments..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Tracking #</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading shipments...
                    </TableCell>
                  </TableRow>
                ) : paginatedShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No shipments found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium text-primary">
                        {shipment.trackingNumber}
                      </TableCell>
                      <TableCell>{shipment.destination}</TableCell>
                      <TableCell>
                        <div className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(shipment.status)}`}>
                          {shipment.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(shipment.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{shipment.customerName}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewShipment(shipment)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditShipment(shipment)}
                        >
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{totalShipments > 0 ? startIndex + 1 : 0}</span>{" "}
              to <span className="font-medium">{endIndex}</span> of{" "}
              <span className="font-medium">{totalShipments}</span> shipments
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 3) }).map((_, index) => {
                const pageNumber = currentPage <= 2 ? index + 1 : 
                  currentPage >= totalPages - 1 ? totalPages - 2 + index : 
                  currentPage - 1 + index;

                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={currentPage === pageNumber ? "bg-primary" : ""}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* View Shipment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected shipment
            </DialogDescription>
          </DialogHeader>
          
          {selectedShipment && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Shipment Details</TabsTrigger>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Package className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                        <p className="text-lg font-semibold text-primary">{selectedShipment.trackingNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Shipment Date</p>
                        <p>{new Date(selectedShipment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <div className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedShipment.status)}`}>
                          {selectedShipment.status}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Destination</p>
                        <p>{selectedShipment.destination}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <User className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Customer</p>
                        <p>{selectedShipment.customerName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tracking">
                <div className="py-4">
                  <div className="space-y-4">
                    {/* This would be populated with actual tracking data from Aramex API */}
                    <p className="text-center text-gray-500 py-8">
                      Tracking information would be loaded from Aramex API
                    </p>
                    <Button className="w-full">
                      Track via Aramex
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notes">
                <div className="py-4 space-y-4">
                  <div className="space-y-4">
                    <Textarea 
                      placeholder="Add a note about this shipment"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                    <Button 
                      onClick={handleAddNote}
                      disabled={!noteText.trim() || addNoteMutation.isPending}
                    >
                      {addNoteMutation.isPending ? "Adding..." : "Add Note"}
                    </Button>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Previous Notes</h4>
                    {selectedShipment.notes && selectedShipment.notes.length > 0 ? (
                      <div className="space-y-2">
                        {selectedShipment.notes.map((note, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm">{note.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(note.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No notes for this shipment yet</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Shipment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Shipment Status</DialogTitle>
            <DialogDescription>
              Change the status of the shipment
            </DialogDescription>
          </DialogHeader>
          
          {selectedShipment && (
            <div className="py-4">
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Tracking Number</p>
                <p className="text-lg font-semibold text-primary">
                  {selectedShipment.trackingNumber}
                </p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Current Status</p>
                <div className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedShipment.status)}`}>
                  {selectedShipment.status}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">New Status</p>
                <Select
                  defaultValue={selectedShipment.status.toLowerCase().replace(' ', '-')}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-primary" 
              onClick={() => {
                if (selectedShipment) {
                  // Status is already updated through the select onChange
                  setIsEditDialogOpen(false);
                }
              }}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
