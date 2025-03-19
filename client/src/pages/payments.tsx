import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, CreditCard, Plus } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
  status: string;
  notes?: string;
  receivedBy: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  currency: string;
}

export default function Payments() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  // Fetch all payment transactions
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['/api/payments'],
    queryFn: async () => {
      // Since we don't have a dedicated endpoint for all payments yet,
      // let's fetch them from individual invoices for demonstration purposes
      const invoicesRes = await fetch('/api/invoices');
      if (!invoicesRes.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      const invoices = await invoicesRes.json() as any[];
      
      // Fetch payments for each invoice
      const paymentPromises = invoices.map(async (invoice) => {
        const res = await fetch(`/api/invoices/${invoice.id}/payments`);
        if (!res.ok) return [];
        return res.json();
      });
      
      const allPaymentsArrays = await Promise.all(paymentPromises);
      return allPaymentsArrays.flat();
    }
  });

  // Fetch invoice data for reference
  const { data: invoices } = useQuery({
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
      <DashboardLayout title="Payments">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Payment Transactions</h1>
          </div>
          <p>Loading payment transactions...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Payments">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Payment Transactions</h1>
          </div>
          <p className="text-red-500">Error loading payment transactions. Please try again later.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate totals and stats
  const totalPayments = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const creditCardPayments = payments?.filter(p => p.paymentMethod === 'credit_card').reduce((sum, p) => sum + p.amount, 0) || 0;
  const bankTransferPayments = payments?.filter(p => p.paymentMethod === 'bank_transfer').reduce((sum, p) => sum + p.amount, 0) || 0;
  
  const getInvoiceNumber = (invoiceId: number) => {
    const invoice = invoices?.find(i => i.id === invoiceId);
    return invoice?.invoiceNumber || 'Unknown';
  };

  const getCustomerName = (invoiceId: number) => {
    const invoice = invoices?.find(i => i.id === invoiceId);
    return invoice?.customerName || 'Unknown';
  };
  
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  return (
    <DashboardLayout title="Payments">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payment Transactions</h1>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            <span>Record Payment</span>
          </Button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Payments</CardTitle>
              <CardDescription>All time payment amount</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalPayments.toFixed(2)}</div>
              <p className="text-sm text-gray-500">{payments?.length || 0} transactions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Credit Card Payments</CardTitle>
              <CardDescription>Total processed via cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${creditCardPayments.toFixed(2)}</div>
              <p className="text-sm text-gray-500">
                {payments?.filter(p => p.paymentMethod === 'credit_card').length || 0} transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Bank Transfers</CardTitle>
              <CardDescription>Total processed via bank</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">${bankTransferPayments.toFixed(2)}</div>
              <p className="text-sm text-gray-500">
                {payments?.filter(p => p.paymentMethod === 'bank_transfer').length || 0} transactions
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>Manage and track all customer payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="font-medium">{payment.transactionId}</TableCell>
                    <TableCell>{getInvoiceNumber(payment.invoiceId)}</TableCell>
                    <TableCell>{getCustomerName(payment.invoiceId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {payment.paymentMethod.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={payment.status === "completed" ? "default" : "outline"}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleViewPayment(payment)}
                      >
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {payments?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No payment transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment Detail Modal */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Transaction Details</DialogTitle>
              <DialogDescription>
                {selectedPayment.transactionId}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Invoice</h3>
                  <p>{getInvoiceNumber(selectedPayment.invoiceId)}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Customer</h3>
                  <p>{getCustomerName(selectedPayment.invoiceId)}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Payment Date</h3>
                  <p>{format(new Date(selectedPayment.paymentDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Payment Method</h3>
                  <p className="capitalize">
                    {selectedPayment.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Amount</h3>
                  <p className="text-xl font-bold">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Status</h3>
                  <Badge
                    variant={selectedPayment.status === "completed" ? "default" : "outline"}
                  >
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Received By</h3>
                <p>{selectedPayment.receivedBy}</p>
              </div>
              
              {selectedPayment.notes && (
                <div>
                  <h3 className="font-semibold mb-1">Notes</h3>
                  <p className="text-gray-600">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}