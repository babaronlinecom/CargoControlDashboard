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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileType,
  Search,
  AlertTriangle,
  Check,
  X,
  Edit,
  Save,
  Trash2
} from "lucide-react";

interface RateFile {
  id: number;
  filename: string;
  uploadDate: string;
  status: 'processed' | 'error' | 'pending';
  errors?: string[];
}

interface RateEntry {
  id: number;
  origin: string;
  destination: string;
  weight: string;
  serviceType: string;
  rate: number;
  currency: string;
  effectiveDate: string;
  expiryDate: string;
}

export default function RateManagement() {
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<RateFile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRates, setEditedRates] = useState<Record<number, RateEntry>>({});
  
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const { data: rateFiles, isLoading: isLoadingFiles } = useQuery<RateFile[]>({
    queryKey: ['/api/rates/files'],
  });
  
  const { data: rateEntries, isLoading: isLoadingRates } = useQuery<RateEntry[]>({
    queryKey: ['/api/rates/entries', selectedFile?.id],
    enabled: !!selectedFile,
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/rates/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rates/files'] });
      toast({
        title: "Success",
        description: "Rate file uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateRatesMutation = useMutation({
    mutationFn: async (rates: RateEntry[]) => {
      return apiRequest('PATCH', '/api/rates/entries', { rates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rates/entries', selectedFile?.id] });
      setIsEditMode(false);
      setEditedRates({});
      toast({
        title: "Success",
        description: "Rates updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/csv') {
      toast({
        title: "Invalid file type",
        description: "Only CSV files are supported",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/csv') {
      toast({
        title: "Invalid file type",
        description: "Only CSV files are supported",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(file);
  };
  
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleViewRates = (file: RateFile) => {
    setSelectedFile(file);
    setIsViewDialogOpen(true);
  };
  
  const handleEditRateChange = (id: number, field: keyof RateEntry, value: string | number) => {
    setEditedRates(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || rateEntries?.find(entry => entry.id === id) || {}),
        [field]: value,
        id
      } as RateEntry
    }));
  };
  
  const handleSaveChanges = () => {
    if (Object.keys(editedRates).length === 0) {
      setIsEditMode(false);
      return;
    }
    
    const updatedRates = Object.values(editedRates);
    updateRatesMutation.mutate(updatedRates);
  };
  
  const filteredRateFiles = rateFiles?.filter(file => {
    if (!searchQuery) return true;
    
    return file.filename.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  return (
    <DashboardLayout title="Rate Management">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>CSV Rate Files</CardTitle>
            <CardDescription>Upload and manage rate CSV files</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className={`p-4 border-2 border-dashed ${
                isDragging ? 'border-primary bg-blue-50' : 'border-gray-300'
              } rounded-md text-center mb-6`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-3">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop a CSV file here, or click to select a file
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Supported format: .csv up to 5MB
              </p>
              <Button 
                className="bg-primary text-white"
                onClick={openFileSelector}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload CSV File"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search files..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isLoadingFiles ? (
              <div className="space-y-3">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 animate-pulse rounded"></div>
                ))}
              </div>
            ) : filteredRateFiles && filteredRateFiles.length > 0 ? (
              <div className="space-y-3">
                {filteredRateFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100">
                    <div className="flex items-center">
                      <FileType className="text-gray-400 mr-2 h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(file.uploadDate).toLocaleDateString('en-US', {
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {file.status === 'error' && (
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      {file.status === 'processed' && (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      )}
                      {file.status === 'pending' && (
                        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-2"></div>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewRates(file)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded">
                No rate files found
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Rate Management Guide</CardTitle>
            <CardDescription>Tips for managing shipping rates efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-md">
                <h3 className="text-lg font-medium text-blue-800 mb-2">CSV Format Requirements</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Ensure your CSV files follow this structure:
                </p>
                <div className="p-2 bg-white rounded-md text-xs font-mono overflow-x-auto">
                  Origin,Destination,Weight,ServiceType,Rate,Currency,EffectiveDate,ExpiryDate
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Example: Dubai,Riyadh,5kg,Express,45.00,USD,2023-01-01,2023-12-31
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-md">
                <h3 className="text-lg font-medium text-green-800 mb-2">Best Practices</h3>
                <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                  <li>Validate all CSV files before uploading</li>
                  <li>Include effective dates for seasonal rate changes</li>
                  <li>Use consistent naming conventions for service types</li>
                  <li>Backup your rate files before making bulk changes</li>
                  <li>Review all rates after import to ensure accuracy</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-md">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Troubleshooting</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  Common issues and solutions:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li>If rates aren't showing up, check for date conflicts</li>
                  <li>Ensure currency codes follow ISO 4217 format (USD, EUR, AED)</li>
                  <li>Verify that origins and destinations use consistent formats</li>
                  <li>For weight-based issues, ensure weight format is consistent (e.g., 5kg, 10kg)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* View/Edit Rates Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedFile?.filename}
              {selectedFile?.status === 'error' && (
                <span className="ml-2 text-sm text-red-500">(Has Errors)</span>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Edit shipping rates - Click on values to modify" : "View shipping rates from the imported file"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile?.status === 'error' && selectedFile.errors && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Validation Errors</AlertTitle>
              <AlertDescription className="max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {selectedFile.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoadingRates ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : !rateEntries || rateEntries.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                No rate entries found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateEntries.map((entry) => {
                    const isEdited = !!editedRates[entry.id];
                    const currentEntry = isEdited ? editedRates[entry.id] : entry;
                    
                    return (
                      <TableRow key={entry.id} className={isEdited ? "bg-blue-50" : ""}>
                        <TableCell>
                          {isEditMode ? (
                            <Input
                              value={currentEntry.origin}
                              onChange={(e) => handleEditRateChange(entry.id, 'origin', e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            entry.origin
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditMode ? (
                            <Input
                              value={currentEntry.destination}
                              onChange={(e) => handleEditRateChange(entry.id, 'destination', e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            entry.destination
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditMode ? (
                            <Input
                              value={currentEntry.weight}
                              onChange={(e) => handleEditRateChange(entry.id, 'weight', e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            entry.weight
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditMode ? (
                            <Input
                              value={currentEntry.serviceType}
                              onChange={(e) => handleEditRateChange(entry.id, 'serviceType', e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            entry.serviceType
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditMode ? (
                            <Input
                              type="number"
                              value={currentEntry.rate}
                              onChange={(e) => handleEditRateChange(entry.id, 'rate', parseFloat(e.target.value))}
                              className="h-8"
                            />
                          ) : (
                            entry.rate.toFixed(2)
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditMode ? (
                            <Input
                              value={currentEntry.currency}
                              onChange={(e) => handleEditRateChange(entry.id, 'currency', e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            entry.currency
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditMode ? (
                            <Input
                              type="date"
                              value={currentEntry.effectiveDate.split('T')[0]}
                              onChange={(e) => handleEditRateChange(entry.id, 'effectiveDate', e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            new Date(entry.effectiveDate).toLocaleDateString()
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditMode ? (
                            <Input
                              type="date"
                              value={currentEntry.expiryDate.split('T')[0]}
                              onChange={(e) => handleEditRateChange(entry.id, 'expiryDate', e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            new Date(entry.expiryDate).toLocaleDateString()
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
          
          <DialogFooter>
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditMode(false);
                  setEditedRates({});
                }}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button 
                  className="bg-primary"
                  onClick={handleSaveChanges}
                  disabled={updateRatesMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateRatesMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete File
                </Button>
                <Button 
                  className="bg-primary"
                  onClick={() => setIsEditMode(true)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Rates
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
