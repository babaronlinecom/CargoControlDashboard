import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText, Printer, Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceViewProps {
  invoiceId: number;
}

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
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  billingAddress: string;
  shippingAddress: string;
}

interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number | null;
  discount: number | null;
  lineTotal: number;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-500';
    case 'unpaid':
      return 'bg-yellow-500';
    case 'overdue':
      return 'bg-red-500';
    case 'cancelled':
      return 'bg-gray-500';
    default:
      return 'bg-blue-500';
  }
};

export function InvoiceView({ invoiceId }: InvoiceViewProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        // Fetch invoice details
        const invoiceData = await apiRequest(`/api/invoices/${invoiceId}`);
        setInvoice(invoiceData as Invoice);

        // Fetch invoice items
        const itemsData = await apiRequest(`/api/invoices/${invoiceId}/items`);
        setItems(itemsData as InvoiceItem[]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        toast({
          title: 'Error',
          description: 'Failed to load invoice details',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, toast]);

  const generatePDF = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/api/invoices/${invoiceId}/pdf`);
      if (response && 'pdfUrl' in response) {
        setPdfUrl(response.pdfUrl as string);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `invoice-${invoice?.invoiceNumber.replace(/\//g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invoice) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-gray-500">Invoice not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-2">
        <CardTitle className="text-xl font-bold">Invoice #{invoice.invoiceNumber}</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
          {!pdfUrl ? (
            <Button
              onClick={generatePDF}
              variant="outline"
              size="sm"
              className="flex items-center"
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View PDF
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh]">
                  <DialogTitle>Invoice #{invoice.invoiceNumber}</DialogTitle>
                  <div className="mt-4 h-full">
                    <iframe src={pdfUrl} className="w-full h-full border rounded" />
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Bill To</h3>
            <p className="mt-1 text-base font-medium">{invoice.customerName}</p>
            <p className="mt-1 text-sm whitespace-pre-line">{invoice.billingAddress}</p>
            {invoice.customerEmail && <p className="text-sm">Email: {invoice.customerEmail}</p>}
            {invoice.customerPhone && <p className="text-sm">Phone: {invoice.customerPhone}</p>}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Ship To</h3>
            <p className="mt-1 text-sm whitespace-pre-line">{invoice.shippingAddress}</p>
            <p className="mt-3 text-sm font-medium text-gray-500">AWB Number</p>
            <p className="mt-1 text-sm">{invoice.awbNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Issue Date</h3>
            <p className="mt-1 text-sm">
              {format(new Date(invoice.issueDate), 'MMMM dd, yyyy')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
            <p className="mt-1 text-sm">
              {format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Description
                </th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                  Qty
                </th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                  Unit Price
                </th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                  Tax
                </th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                  Discount
                </th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                    {item.quantity}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                    {item.taxRate ? `${item.taxRate}%` : '0%'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                    {item.discount ? `${item.discount}%` : '0%'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="px-3 py-4"></td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900 text-right">
                  Total
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-base font-bold text-gray-900 text-right">
                  {formatCurrency(invoice.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {invoice.notes && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 text-sm whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}