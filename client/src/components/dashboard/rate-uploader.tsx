import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileType } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RateFile {
  id: number;
  filename: string;
  uploadDate: string;
}

export function RateUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const { data: rateFiles, isLoading } = useQuery<RateFile[]>({
    queryKey: ['/api/rates/files'],
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
  
  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">CSV Rate Management</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div 
          className={`p-4 border-2 border-dashed ${
            isDragging ? 'border-primary bg-blue-50' : 'border-gray-300'
          } rounded-md text-center`}
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
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Rate Updates</h3>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 animate-pulse rounded"></div>
              ))}
            </div>
          ) : rateFiles && rateFiles.length > 0 ? (
            <div className="space-y-3">
              {rateFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <FileType className="text-gray-400 mr-2 h-4 w-4" />
                    <span className="text-sm">{file.filename}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(file.uploadDate).toLocaleDateString('en-US', {
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric'
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded">
              No rate files uploaded yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
