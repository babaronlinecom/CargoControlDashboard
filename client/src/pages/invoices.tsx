import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, FileText, Printer, Download, Plus } from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  id: number;
  invoiceNumber: string;
  awbNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

export default function Invoices() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['/api/invoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices');
      if (!res.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return res.json() as Promise<Invoice[]>;
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Invoices">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Invoices</h1>
          </div>
          <p>Loading invoices...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Invoices">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Invoices</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">Failed to load invoices</p>
            <p className="text-sm text-red-500 mt-1">
              {error instanceof Error ? error.message : 'Please try again later'}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="destructive" 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter invoices based on selected tab
  const filteredInvoices = selectedTab === "all" 
    ? invoices 
    : invoices?.filter(invoice => invoice.status === selectedTab);

  // Calculate totals for the summary cards
  const totalPaid = invoices?.filter(i => i.status === "paid").reduce((sum, i) => sum + i.totalAmount, 0) || 0;
  const totalUnpaid = invoices?.filter(i => i.status === "unpaid").reduce((sum, i) => sum + i.totalAmount, 0) || 0;
  const totalOverdue = invoices?.filter(i => i.status === "overdue").reduce((sum, i) => sum + i.totalAmount, 0) || 0;
  
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  return (
    <DashboardLayout title="Invoices">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            <span>New Invoice</span>
          </Button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Paid</CardTitle>
              <CardDescription>All time paid invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
              <p className="text-sm text-gray-500">{invoices?.filter(i => i.status === "paid").length || 0} invoices</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Outstanding</CardTitle>
              <CardDescription>Unpaid invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">${totalUnpaid.toFixed(2)}</div>
              <p className="text-sm text-gray-500">{invoices?.filter(i => i.status === "unpaid").length || 0} invoices</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Overdue</CardTitle>
              <CardDescription>Past due invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalOverdue.toFixed(2)}</div>
              <p className="text-sm text-gray-500">{invoices?.filter(i => i.status === "overdue").length || 0} invoices</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Invoices Table with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Management</CardTitle>
            <CardDescription>Manage and track all your customer invoices</CardDescription>
            
            <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>AWB #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices?.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.awbNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>${invoice.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" :
                          invoice.status === "unpaid" ? "outline" :
                          "destructive"
                        }
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Printer size={16} />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Download size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredInvoices?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No invoices found for the selected filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
              <DialogDescription>
                {selectedInvoice.awbNumber ? `AWB: ${selectedInvoice.awbNumber}` : ''}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold mb-1">Customer</h3>
                  <p>{selectedInvoice.customerName}</p>
                  <p>{selectedInvoice.customerEmail}</p>
                  <p>{selectedInvoice.customerPhone}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Status</h3>
                  <Badge
                    variant={
                      selectedInvoice.status === "paid" ? "default" :
                      selectedInvoice.status === "unpaid" ? "outline" :
                      "destructive"
                    }
                    className="text-sm"
                  >
                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Invoice Date</h3>
                  <p>{format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Due Date</h3>
                  <p>{format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Total Amount</h3>
                  <p className="text-xl font-bold">
                    ${selectedInvoice.totalAmount.toFixed(2)} {selectedInvoice.currency}
                  </p>
                </div>
              </div>
              
              {selectedInvoice.notes && (
                <div>
                  <h3 className="font-semibold mb-1">Notes</h3>
                  <p className="text-gray-600">{selectedInvoice.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Printer size={16} />
                  <span>Print</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download size={16} />
                  <span>Download</span>
                </Button>
                <Button className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>View Details</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}